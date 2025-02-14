import socket
import time
import sys
import json
import pathlib
import os
import signal
import confluent_kafka
import docker
import psycopg

TIMELIMIT = int(os.getenv('TIMELIMIT'))
MAX_RAM = int(os.getenv('MAX_RAM'))
KAFKA_ADDR = os.getenv('KAFKA_HOST') + ':' + os.getenv('KAFKA_PORT')
MAX_ACTIVE_TASKS = int(os.getenv('MAX_ACTIVE_TASKS'))
DOCKER_NETWORK = os.getenv('DOCKER_NETWORK')
POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_PORT = os.getenv('POSTGRES_PORT')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_DBNAME = os.getenv('POSTGRES_DBNAME')
DB_TASKS_TABLE_NAME = os.getenv('DB_TASKS_TABLE_NAME')

docker_client = docker.from_env()
docker_api_client = docker.APIClient(base_url='unix://var/run/docker.sock')


def create_consumer():
    consumer = confluent_kafka.Consumer({'bootstrap.servers': KAFKA_ADDR,
                                         'group.id': 'tasks_1',
                                         'session.timeout.ms': 6000,
                                         # 'on_commit': my_commit_callback,
                                         'auto.offset.reset': 'earliest'})
    consumer.subscribe(['tasks'])
    return consumer

# errorType : INTERNAL SERVER ERROR | RESOURCE LIMIT IS REACHED
def update_error_status(taskID, errorType, error):
    with psycopg.connect(f"dbname={POSTGRES_DBNAME} \
    user={POSTGRES_USER} password={POSTGRES_PASSWORD} \
    host={POSTGRES_HOST} port={POSTGRES_PORT}") as conn:
        with conn.cursor() as cur:
            sql = f""" UPDATE "{DB_TASKS_TABLE_NAME}"
                        SET "errorMsg" = %s, "status" = %s
                        WHERE "taskID" = %s""";
            error = error.replace("\'", "\'\'")
            cur.execute(sql, (error, errorType, taskID))
            conn.commit()

def update_internal_server_error(taskID, error):
    update_error_status(taskID, "INTERNAL_SERVER_ERROR", error)

# error: MEMORY LIMIT | TIME LIMIT
def update_resource_limit_error(taskID, error):
    update_error_status(taskID, "RESOURCE_LIMIT_IS_REACHED", error)


def check_active_containers(active_tasks):
    for taskID, (container, t) in active_tasks.items():
        container.reload()
        # print(container.logs(), file=sys.stderr)

        print(taskID, container, container.status,
              f'{int(time.time() - t)}s', file=sys.stderr)

        if time.time() - t >= TIMELIMIT:
            # TL
            print(f'time exceeded for {taskID}, container {container} removed')
            container.stop(timeout=1)
            container.remove()
            active_tasks.pop(taskID)
            update_resource_limit_error(taskID, "TIME_LIMIT")
            break

        container_state = docker_api_client.inspect_container(container.id)[
            "State"]

        OOMKilled = container_state["OOMKilled"]
        if OOMKilled:
            # ML
            print(f"{taskID} ML", file=sys.stderr)
            container.remove()
            active_tasks.pop(taskID)
            update_resource_limit_error(taskID, "MEMORY_LIMIT")
            break

        if container.status == "exited":
            exitCode = container_state["ExitCode"]
            if exitCode == 0: # TASK_SUCCESSFULLY_PROCESSED
                print(f"[{taskID}] task done successfully", file=sys.stderr)
                print(container.logs())
            elif exitCode == 1: # TASK_CRASHED_STATUS_UPDATED
                print(f"[{taskID}] cpp-consumer has crashed, status was updated by cpp-consumer", file=sys.stderr)
                print(container.logs())
            elif exitCode == 2: # TASK_CRASHED_WITHOUT_STATUS_UPDATING
                print(f"[{taskID}] cpp-consumer has crashed without status updating", file=sys.stderr)
                update_internal_server_error(taskID, f"Crash {container.logs()}")
                print(container.logs())
            elif exitCode == 3: # TASK_NOT_FOUND
                print(f"[{taskID}] task not found", file=sys.stderr)

            container.remove()
            active_tasks.pop(taskID)
            break


def create_container(taskID):
    print(f"creating container for {taskID}", file=sys.stderr)
    env_variables = {
        "POSTGRES_HOST": POSTGRES_HOST,
        "POSTGRES_PORT": POSTGRES_PORT,
        "POSTGRES_USER": POSTGRES_USER,
        "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
        "POSTGRES_DBNAME": POSTGRES_DBNAME
    }
    return docker_client.containers.run("cpp-consumer:latest",
                                        network=DOCKER_NETWORK,
                                        command=taskID,
                                        volumes=[
                                            'desbordante_uploads:/server/uploads/',
                                            'desbordante_datasets:/build/target/inputData/'],
                                        detach=True,
                                        mem_limit=f'{MAX_RAM}m',
                                        environment=env_variables,
                                        labels={"type": "cpp-consumer"})


def main(containers):
    consumer = create_consumer()

    while True:
        check_active_containers(containers)

        containers_amount = len(containers)
        if containers_amount >= MAX_ACTIVE_TASKS:
            time.sleep(1)
            continue

        msg = consumer.poll(3.0)

        if msg is None:
            continue
        if msg.error():
            print(f"Consumer error: {msg.error()}", file=sys.stderr)
            continue

        print(f'Received task: {msg.value().decode("utf-8")}', file=sys.stderr)
        taskID = json.loads(msg.value().decode('utf-8'))['taskID']

        container = create_container(taskID)
        containers[taskID] = (container, time.time())

    consumer.close()


def exit_gracefully(*args):
    for taskID, (container, t) in containers.items():
        container.stop(timeout=1)
        container.remove(force=True)


def remove_dangling_containers():
    active_cpp_containers = docker_client.containers.list(
        filters={"label": "type=cpp-consumer"})
    for container in active_cpp_containers:
        print("removing", container.id, file=sys.stderr)
        container.stop(timeout=1)
        container.remove(force=True)


containers = dict()
signal.signal(signal.SIGINT, exit_gracefully)
signal.signal(signal.SIGTERM, exit_gracefully)
try:
    remove_dangling_containers()
    main(containers)
except:
    exit_gracefully()

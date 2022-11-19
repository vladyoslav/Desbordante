import { gql } from "@apollo/client";

export const CREATE_TASK_WITH_UPLOADING_DATASET = gql`
  mutation createMainTaskWithDatasetUploading(
    $props: IntersectionMainTaskProps!
    $datasetProps: FileProps!
    $table: Upload!
  ) {
      createMainTaskWithDatasetUploading(props: $props, datasetProps: $datasetProps, table: $table) {
          taskID
      }
  }
`;

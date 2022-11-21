import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import plexus from '@public/plexus.jpg';
import Button from '../components/Button';
import ExternalLink from '../components/ExternalLink';
import styles from '../styles/Home.module.scss';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.home}>
      <div className={styles.background}>
        <img
          src={plexus.src}
          className={styles.background_image}
          alt="background"
        />
      </div>

      <div className={styles.home_text}>
        <h1 className={styles.name_main}>Desbordante</h1>
        <h6 className={styles.description}>Open-source data profiling tool</h6>
        <div className={styles.links}>
          <Button
            variant="gradient"
            onClick={() => router.push('/create-task/choose-file')}
          >
            Get Started
          </Button>

          <ExternalLink href="https://github.com/Mstrutov/Desbordante">
            GitHub
          </ExternalLink>
          <ExternalLink href="https://mstrutov.github.io/Desbordante">
            User Guide
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};

export default Home;

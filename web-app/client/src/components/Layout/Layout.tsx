import { useContext } from 'react';
import Head from 'next/head';
import { AuthContext } from '@components/AuthContext';
import SignUpForm from '@components/SignUpForm';
import Header from '@components/Header';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';
import LogInForm from '@components/LogInForm/LogInForm';
import { ErrorContext } from '@components/ErrorContext';

const Layout: FCWithChildren = ({ children }) => {
  const { isSignUpShown, isFeedbackShown, isLogInShown } =
    useContext(AuthContext)!;
  const { error, isErrorShown, hideError } = useContext(ErrorContext)!;
  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      {isErrorShown && (
        <div className={styles.error}>
          <p onClick={hideError}>{error?.message}</p>
        </div>
      )}

      {isSignUpShown && <SignUpForm />}
      {isLogInShown && <LogInForm />}
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;

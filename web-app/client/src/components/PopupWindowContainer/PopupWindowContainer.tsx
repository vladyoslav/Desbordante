import Head from 'next/head';
import React, { PropsWithChildren } from 'react';
import { Container } from 'react-bootstrap';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSpring, animated } from 'react-spring';
//@ts-ignore @todo

import styles from './PopupWindowContainer.module.scss';

interface Props {
  onOutsideClick: () => void;
}

const PopupWindowContainer: React.FC<PropsWithChildren<any>> = ({
  children,
  onOutsideClick,
}) => {
  const containerProps = useSpring({
    from: {
      opacity: 0,
      transform: 'translate3d(0, 3%, 0)',
    },
    to: {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
    },
    config: {
      tension: 300,
    },
  });

  const AnimatedContainer = animated(Container);

  return (
    <AnimatedContainer
      fluid
      className={`${styles.popup_bg} bg-black bg-opacity-50 position-fixed h-100 flex-grow-1 d-flex align-items-center justify-content-center p-3`}
      style={containerProps}
    >
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"
        />
      </Head>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        <>{children}</>
      </OutsideClickHandler>
    </AnimatedContainer>
  );
};

export default PopupWindowContainer;

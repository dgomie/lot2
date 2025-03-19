import React from 'react';
import styles from './Welcome.module.css';
import Image from 'next/image';

const Welcome = () => {
  return (
    <div className={styles.mainContainer}>
    <Image
      src="/img/logo.svg"
      alt="Legion of Tones Logo"
      width={400}
      height={400}
    />
    </div>
  );
};

export default Welcome;

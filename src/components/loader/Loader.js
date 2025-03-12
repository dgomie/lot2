import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.loading}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={styles.text}>Loading</div>
    </div>
  );
};

export default Loader;

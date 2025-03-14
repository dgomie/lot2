import React from 'react';
import styles from './Spinner.module.css';

const Spinner = () => {
  return (
    <div className={styles['dot-spinner']}>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
      <div className={styles['dot-spinner__dot']}></div>
    </div>
  );
};

export default Spinner;

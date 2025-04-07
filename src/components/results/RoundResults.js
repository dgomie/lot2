import React from 'react';
import styles from './RoundResults.module.css';

export const RoundResults = (currentUser, roundData) => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Round Results</div>
      <div className={styles.roundInfoContainer}>
        <div>Song</div>
        <div>user</div>
        <div>vote count</div>
      </div>
    </div>
  );
};

'use client'
import React from 'react';
import styles from './round.module.css';
import withAuth from '@/hoc/withAuth';

const FalseNotesRound = () => {
  return (
    <div className={styles.mainContainer}>
      <div>False Notes Round Page</div>
    </div>
  );
};

export default withAuth(FalseNotesRound);
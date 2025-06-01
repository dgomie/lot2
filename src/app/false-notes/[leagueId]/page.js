'use client'
import React from 'react';
import styles from './league.module.css';
import withAuth from '@/hoc/withAuth';

const FalseNotesLeaguePage = () => {
  return (
    <div className={styles.mainContainer}>
      <div>False Notes League Page</div>
    </div>
  );
};

export default withAuth(FalseNotesLeaguePage);
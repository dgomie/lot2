'use client'
import React from 'react';
import styles from './false-notes.module.css';
import withAuth from '@/hoc/withAuth';

const FalseNotesLeagues = () => {
  return (
    <div className={styles.mainContainer}>
      <div>False Notes League Page</div>
    </div>
  );
};

export default withAuth(FalseNotesLeagues);
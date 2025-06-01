'use client'
import React from 'react';
import styles from './false-notes.module.css';
import withAuth from '@/hoc/withAuth';

const FalseNotesLeaguesDashboard = () => {
  return (
    <div className={styles.mainContainer}>
      <div>False Notes Leagues Dashboard</div>
    </div>
  );
};

export default withAuth(FalseNotesLeaguesDashboard);
'use client'
import React from 'react';
import styles from './false-notes.module.css';
import withAuth from '@/hoc/withAuth';
import DashboardCard from '@/components/dashboardCard/DashboardCard';

const FalseNotesLeaguesDashboard = () => {
  return (
    <div className={styles.mainContainer}>
      <div>False Notes Leagues Dashboard</div>
      <DashboardCard />
    </div>
  );
};

export default withAuth(FalseNotesLeaguesDashboard);
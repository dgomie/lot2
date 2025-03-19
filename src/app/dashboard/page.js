'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/button/Button';
import styles from './dashboard.module.css';
import DashboardFeed from '@/components/dashboardFeed/DashboardFeed';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const handleButtonClick = (location) => {
    router.push(location);
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Dashboard</h1>
      <div>{currentUser.uid}</div>
      {currentUser && <p>Welcome, {currentUser.username}!</p>}
      <div className={styles.title}>Your Active Legions</div>
      <div className={styles.buttonContainer}>
        <Button
          onClick={() => {
            handleButtonClick('./create-legion');
          }}
        >
          Create a Legion
        </Button>
        <Button
          onClick={() => {
            handleButtonClick('./legions');
          }}
        >
          Join a Legion
        </Button>
      </div>
      <DashboardFeed currentUserId={currentUser.uid} />
    </div>
  );
};

export default withAuth(Dashboard);

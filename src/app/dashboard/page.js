'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/button/Button';
import styles from './dashboard.module.css';
import DashboardFeed from '@/components/dashboardFeed/DashboardFeed';
import BubbleMenu from '@/components/bubbleMenu/BubbleMenu';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const handleButtonClick = (location) => {
    router.push(location);
  };

  return (
    <div className={styles.mainContainer}>
      {currentUser && <p>Welcome, {currentUser.username}!</p>}
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
      <div className={styles.title}>Your Active Legions</div>

      <DashboardFeed currentUserId={currentUser.uid} />
      <BubbleMenu />
    </div>
  );
};

export default withAuth(Dashboard);

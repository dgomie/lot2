'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
      <div className={styles.dashboardContainer}>
        {currentUser && (
          <div className={styles.welcomeMessage}>
            Welcome, {currentUser.username}!
          </div>
        )}
        <DashboardFeed currentUserId={currentUser.uid} />
        <div className={styles.BubbleMenu}>
          <BubbleMenu />
        </div>
      </div>
    </div>
  );
};

export default withAuth(Dashboard);

'use client';

import React, { useContext, useEffect } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import DashboardFeed from '@/components/dashboardFeed/DashboardFeed';
import BubbleMenu from '@/components/bubbleMenu/BubbleMenu';
import { DashboardHeader } from '@/components/dashboardHeader/DashboardHeader';
import Image from 'next/image';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);

  const handleButtonClick = (location) => {
    router.push(location);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mobileHeader}>
        <DashboardHeader currentUserImage={currentUser.profileImg} />
      </div>
      <div className={styles.dashboardContainer}>
        {currentUser && (
          <div className={styles.desktopWelcome}>
            <Image
              src={currentUser.profileImg}
              width={50}
              height={50}
              alt="User profile image"
              style={{ borderRadius: '50%' }}
            />
            <div className={styles.welcomeMessage}>
              Welcome, {currentUser.username}!
            </div>
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

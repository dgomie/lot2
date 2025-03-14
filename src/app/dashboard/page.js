'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import Button from '@/components/button/Button';
import styles from './dashboard.module.css'

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className={styles.mainContainer}>
      <h1>Dashboard</h1>
      {currentUser && <p>Welcome, {currentUser.username}!</p>}
      <div className={styles.title}>Your Active Legions</div>
      <div className={styles.buttonContainer}>
        <Button>Start a Legion</Button>
        <Button>Join a Legion</Button>
      </div>
    </div>
  );
};

export default withAuth(Dashboard);

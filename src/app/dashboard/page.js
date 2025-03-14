'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <h1>Dashboard</h1>
      {currentUser && <p>Welcome, {currentUser.username}!</p>}
      {/* Your dashboard content */}
    </div>
  );
};

export default withAuth(Dashboard);
'use client';

import React from 'react';
import withAuth from '../../hoc/withAuth';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Your dashboard content */}
    </div>
  );
};

export default withAuth(Dashboard);
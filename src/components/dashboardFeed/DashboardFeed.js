import React, { useEffect, useState } from 'react';
import styles from './DashboardFeed.module.css';
import DashboardCard from '../dashboardCard/DashboardCard';

const DashboardFeed = ({currentUser
}) => {
  

  return (
    <div onClick={onClick} className={styles.mainContainer} >
        {currentUser}
    </div>
  );
};

export default DashboardFeed;

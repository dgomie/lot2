'use client'; // Ensure this is a client-side component

import React from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for client-side routing
import styles from './DashboardHeader.module.css';
import Image from 'next/image';

export const DashboardHeader = ({ currentUserImage }) => {
  const router = useRouter(); // Initialize the router

  const handleLogoClick = () => {
    if (router) {
      router.push('/dashboard'); // Navigate to /dashboard
    }
  };

  const handleIconClick = () => {
    if (router) {
      router.push('/profile');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Image
        src={'/img/navlogo.svg'}
        width={100}
        height={100}
        alt="Legion of Tones Logo"
        onClick={handleLogoClick} // Add the click handler
      />
      <div className={styles.imageContainer}>
        <Image
          src={currentUserImage}
          width={50}
          height={50}
          alt="user profile"
          onClick={handleIconClick}
          style={{borderRadius: '50%'}}
        />
      </div>
    </div>
  );
};

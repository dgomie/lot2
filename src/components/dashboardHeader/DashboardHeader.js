'use client'; 

import React from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './DashboardHeader.module.css';
import Image from 'next/image';

export const DashboardHeader = ({ currentUser }) => {
  const router = useRouter(); 

  const handleLogoClick = () => {
    if (router) {
      router.push('/dashboard');
    }
  };

  const handleIconClick = () => {
    if (router) {
      router.push(`/profile/${currentUser.username}`);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Image
        src={'/img/navlogo.svg'}
        width={100}
        height={100}
        alt="Legion of Tones Logo"
        onClick={handleLogoClick} 
      />
      <div className={styles.imageContainer}>
        <Image
          src={currentUser.profileImg || '/img/user.png'}
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

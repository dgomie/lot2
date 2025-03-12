'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '../../context/AuthContext';
import styles from './profile.module.css';
import ProfileCard from '@/components/profileCard/ProfileCard';
import profileData from '@/data/profileData';
import Loader from '@/components/loader/Loader';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  const mockUserData = {
    legionsJoined: 2,
    treasuresWon: 1,
    songsShared: 12,
    votesCast: 24,
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Profile</h1>
      {currentUser ? (
        <>
          <p>Username: {currentUser.username}</p>
          <p>Email: {currentUser.email}</p>

          <div className={styles.categories}>
            {profileData.map((item, index) => (
              <ProfileCard
                key={index}
                title={item.title}
                numValue={mockUserData[item.id]}
                iconUrl={item.iconUrl}
              />
            ))}
          </div>
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default withAuth(Profile);

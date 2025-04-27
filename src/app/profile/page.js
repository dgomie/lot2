'use client';

import React, { useContext, useEffect, useState } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import styles from './profile.module.css';
import ProfileHeader from '@/components/profileHeader/ProfileHeader';
import ProfileCard from '@/components/profileCard/ProfileCard';
import profileData from '@/data/profileData';
import Loader from '@/components/loader/Loader';
import { getUserProfile } from '@/firebase';
import Button from '@/components/button/Button';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [photoUrl, setPhotoUrl] = useState('/img/user.png');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        if (profile && profile.profileImg) {
          setPhotoUrl(profile.profileImg);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  if (loading || !userProfile) {
    return <Loader />;
  }

  return (
    <div className={styles.mainContainer}>
      {currentUser ? (
        <>
          <div className={styles.profileHeader}>
            <ProfileHeader
              userId={currentUser.uid}
              username={currentUser.username}
              createdAt={currentUser.metadata.creationTime}
              profileImg={photoUrl}
              currentUserId={currentUser.uid}
            />
          </div>

        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default withAuth(Profile);

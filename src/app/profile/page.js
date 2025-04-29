'use client';

import React, { useContext, useEffect, useState } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import styles from './profile.module.css';
import ProfileHeader from '@/components/profileHeader/ProfileHeader';
import Loader from '@/components/loader/Loader';
import { getUserProfile } from '@/firebase';
import Button from '@/components/button/Button';
import { ProfileSettings } from '@/components/profileSettings/ProfileSettings';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [photoUrl, setPhotoUrl] = useState('/img/user.png');
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

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

  const handleButtonClick = () => {
    router.push(`/profile/${currentUser.username}`);
  };

  return (
    <div className={styles.mainContainer}>
      {currentUser ? (
        <>
          <div className={styles.buttonContainer}>
            <Button variant="transparentGray" onClick={handleButtonClick}>
              View Public Profile
            </Button>
          </div>
          <div className={styles.profileHeader}>
            <ProfileHeader
              userId={currentUser.uid}
              username={currentUser.username}
              createdAt={currentUser.metadata.creationTime}
              profileImg={photoUrl}
              currentUserId={currentUser.uid}
            />
          </div>
          <div className={styles.settingsContainer}>
            <ProfileSettings currentUser={currentUser} />
          </div>
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default withAuth(Profile);

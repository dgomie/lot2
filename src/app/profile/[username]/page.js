'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import styles from './profileid.module.css';
import ProfileHeader from '@/components/profileHeader/ProfileHeader';
import ProfileCard from '@/components/profileCard/ProfileCard';
import profileData from '@/data/profileData';
import Loader from '@/components/loader/Loader';
import { getUserProfileByUsername } from '@/firebase';
import withAuth from '@/hoc/withAuth';

const AnyUserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const params = useParams();
  const username = params.username;
  const [photoUrl, setPhotoUrl] = useState('/img/user.png');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (username) {
        try {
          const profile = await getUserProfileByUsername(username);
          setUserProfile(profile);
          if (profile && profile.profileImg) {
            setPhotoUrl(profile.profileImg);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return <Loader />;
  }

  if (!userProfile) {
    return <p>User not found.</p>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.profileHeader}>
        <ProfileHeader
          userId={userProfile.uid}
          username={userProfile.username}
          createdAt={userProfile.createdAt}
          profileImg={photoUrl}
          currentUserId={currentUser.uid}
        />
      </div>
      <div className={styles.categories}>
        {profileData.map((item, index) => (
          <ProfileCard
            key={index}
            title={item.title}
            numValue={userProfile[item.id]}
            iconUrl={item.iconUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default withAuth(AnyUserProfile);

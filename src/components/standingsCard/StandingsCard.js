import React, { useEffect, useState } from 'react';
import styles from './StandingsCard.module.css';
import { getUserProfile } from '@/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const StandingsCard = ({ standings }) => {
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profileMap = {};
      for (const item of standings) {
        if (item.uid) {
          try {
            const userProfile = await getUserProfile(item.uid);
            profileMap[item.uid] = {
              username: userProfile?.username || 'Unknown User',
              profileImg: userProfile?.profileImg || '/img/user.png',
            };
          } catch (error) {
            console.error(`Error fetching profile for UID ${item.uid}:`, error);
            profileMap[item.uid] = {
              username: 'Unknown User',
              profileImage: '/default-profile.png',
            };
          }
        }
      }
      setUserProfiles(profileMap);
    };

    fetchUserProfiles();
  }, [standings]);

  const sortedStandings = standings.sort((a, b) => b.votes - a.votes);

  const router = useRouter();

  const handleImageClick = (username) => {
    if (username) {
      router.push(`/profile/${username}`);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Standings</div>
      {sortedStandings.map((item, index) => (
        <div key={item.uid || index} className={styles.standingItem}>
          <div className={styles.rank}>#{index + 1}</div>
          <div
            className={styles.userInfo}
            onClick={() => handleImageClick(userProfiles[item.uid]?.username)}
          >
            <Image
              src={userProfiles[item.uid]?.profileImg || '/img/user.png'}
              alt={`${
                userProfiles[item.uid]?.username || 'Unknown User'
              }'s profile`}
              width={40}
              height={40}
              className={styles.profileImage}
            />

            <div className={styles.name}>
              {userProfiles[item.uid]?.username || 'Loading...'}
            </div>
          </div>
          <div className={styles.votes}>{item.votes}pts</div>
        </div>
      ))}
    </div>
  );
};

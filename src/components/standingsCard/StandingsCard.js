import React, { useEffect, useState } from 'react';
import styles from './StandingsCard.module.css';
import { getUserProfile } from '@/firebase';

export const StandingsCard = ({ standings }) => {
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const usernameMap = {};
      for (const item of standings) {
        if (item.uid) {
          try {
            const userProfile = await getUserProfile(item.uid);
            usernameMap[item.uid] = userProfile?.username || 'Unknown User';
          } catch (error) {
            console.error(`Error fetching username for UID ${item.uid}:`, error);
            usernameMap[item.uid] = 'Unknown User';
          }
        }
      }
      setUsernames(usernameMap);
    };

    fetchUsernames();
  }, [standings]);

  const sortedStandings = standings.sort((a, b) => b.votes - a.votes);

  return (
    <div className={styles.mainContainer}>
        <div className={styles.title}>Standings</div>
      {sortedStandings.map((item, index) => (
        <div key={item.uid || index} className={styles.standingItem}>
          <div className={styles.rank}>#{index + 1}</div>
          <div className={styles.name}>
            {usernames[item.uid] || 'Loading...'}
          </div>
          <div className={styles.votes}>{item.votes} votes</div>
        </div>
      ))}
    </div>
  );
};
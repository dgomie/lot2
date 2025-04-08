import React, { useEffect, useState } from 'react';
import styles from './StandingsCard.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const StandingsCard = ({ standings, legionPlayers }) => {
  const [userProfiles, setUserProfiles] = useState({});
  const router = useRouter();

  useEffect(() => {
    const profileMap = legionPlayers.reduce((map, player) => {
      map[player.userId] = {
        username: player.username || 'Unknown User',
        profileImg: player.profileImg || '/img/user.png',
      };
      return map;
    }, {});
    setUserProfiles(profileMap);
  }, [legionPlayers]);

  const sortedStandings = standings.sort((a, b) => b.votes - a.votes);

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
import React, { useEffect, useState } from 'react';
import styles from './Players.module.css';
import { getUserProfile } from '@/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Players = ({ legionPlayers }) => {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayersData = async () => {
      try {
        const players = await Promise.all(
          legionPlayers.map(async (uid) => {
            const userData = await getUserProfile(uid);
            return { uid, ...userData };
          })
        );
        setPlayersData(players);
      } catch (error) {
        console.error('Error fetching players data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (legionPlayers?.length) {
      fetchPlayersData();
    }
  }, [legionPlayers]);

  if (loading) {
    return <div className={styles.loading}>Loading players...</div>;
  }

  const handleProfileClick = (username) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className={styles.mainContainer}>
      <h2>Players</h2>
      <div className={styles.playersList}>
        {playersData.map((player) => (
          <div
            key={player.uid}
            className={styles.playerCard}
            onClick={() => handleProfileClick(player.username)}
          >
            <Image
              src={player.profileImg || '/img/user.png'}
              alt={`${player.username}'s profile`}
              className={styles.profileImg}
              width={25}
              height={25}
            />
            <div className={styles.username}>
              {player.username || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;

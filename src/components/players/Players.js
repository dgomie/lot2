import React, { useEffect, useState } from 'react';
import styles from './Players.module.css';
import { getUserProfile } from '@/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '../button/Button';

const Players = ({ legionPlayers, legionAdmin }) => {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6); 
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

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); 
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.playersList}>
        {playersData.slice(0, visibleCount).map((player) => (
          <div
            key={player.uid}
            className={styles.playerCard}
            onClick={() => handleProfileClick(player.username)}
          >
            <div className={styles.imageContainer}>
              <Image
                src={player.profileImg || '/img/user.png'}
                alt={`${player.username}'s profile`}
                className={styles.profileImg}
                width={25}
                height={25}
              />
              {player.uid === legionAdmin && (
                <div className={styles.adminBadge}>★</div>
              )}
            </div>
            <div className={styles.username}>
              {player.username || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
      {visibleCount < playersData.length && (
        <Button className={styles.showMoreButton} onClick={handleShowMore} variant='transparentBlack'>
          See More
        </Button>
      )}
    </div>
  );
};

export default Players;

import React, { useEffect, useState } from 'react';
import styles from './Players.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '../button/Button';

const Players = ({ legionPlayers, legionAdmin }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const router = useRouter();

  const handleProfileClick = (username) => {
    router.push(`/profile/${username}`);
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.playersList}>
        {legionPlayers.slice(0, visibleCount).map((player) => (
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
              {player.userId === legionAdmin && (
                <div className={styles.adminBadge}>★</div>
              )}
            </div>
            <div className={styles.username}>
              {player.username || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
      {visibleCount < legionPlayers.length && (
        <div className={styles.showMoreButton}>
          <Button onClick={handleShowMore} variant="transparentGray">
            See More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Players;

import React from 'react';
import styles from './VoteCard.module.css'
import SongCard from '../songCard/SongCard';

const VoteCard = () => {
  return (
    <div className={styles.mainContainer}>
      <SongCard />
    </div>
  );
};

export default VoteCard;

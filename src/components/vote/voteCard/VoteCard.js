import React from 'react';
import styles from './VoteCard.module.css';
import SongCard from '../songCard/SongCard';

const VoteCard = ({ submissions }) => {
  return (
    <div className={styles.mainContainer}>
      {submissions.map((submission, index) => (
        <SongCard key={index} youtubeUrl={submission.youtubeUrl} />
      ))}
    </div>
  );
};

export default VoteCard;

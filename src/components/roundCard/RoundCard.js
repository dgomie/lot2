import React from 'react';
import styles from './RoundCard.module.css';

const RoundCard = ({ round }) => {
  return (
    <div className={styles.card}>
      <div className={styles.card__image}></div>
      <div className={styles.card__content}>
        <span className={styles.card__title}>Round {round.roundNumber}</span>
        <p className={styles.card__describe}>
          Prompt: {round.prompt || 'No prompt available'}
        </p>
        <p className={styles.card__describe}>
          Submission Deadline:{' '}
          {new Date(round.submissionDeadline).toLocaleString()}
        </p>
        <p className={styles.card__describe}>
          Vote Deadline: {new Date(round.voteDeadline).toLocaleString()}
        </p>
        <p className={styles.card__describe}>
          Status: {round.isRoundComplete ? 'Complete' : 'In Progress'}
        </p>
      </div>
    </div>
  );
};

export default RoundCard;

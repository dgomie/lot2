import React from 'react';
import styles from './RoundCard.module.css';

const RoundCard = ({ round }) => {
  return (
    <div className={styles.roundCard}>
      <div className={styles.roundNumber}>Round {round.roundNumber}</div>
      <div className={styles.status}>
        Prompt: {round.prompt}
      </div>
      <div className={styles.deadlines}>
        <div>
          Submission Deadline:{' '}
          {new Date(round.submissionDeadline).toLocaleString()}
        </div>
        <div>
          Vote Deadline: {new Date(round.voteDeadline).toLocaleString()}
        </div>
      </div>
      <div className={styles.status}>
        Status: {round.isRoundComplete ? 'Complete' : 'In Progress'}
      </div>
    </div>
  );
};

export default RoundCard;

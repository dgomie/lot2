import React from 'react';
import styles from './RoundResults.module.css';

export const RoundResults = ({ currentUser, roundData, userProfiles }) => {
  const sortedSubmissions = [...(roundData.submissions || [])].sort(
    (a, b) => b.voteCount - a.voteCount
  );

  const userStyle = (submissionUid) => {
    return currentUser.uid === submissionUid ? styles.currentUser : '';
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Round Results</div>

      {sortedSubmissions.map((submission) => {
        const username =
          userProfiles.find((user) => user.uid === submission.uid)?.username ||
          'Unknown User';

        return (
          <div key={submission.uid} className={styles.resultInfo}>
            <div className={styles.videoTitle}>{submission.videoTitle}</div>
            <div className={styles.resultRow}>
              <div
                className={`${styles.username} ${userStyle(submission.uid)}`}
              >
                {username}
              </div>
              <div className={styles.votes}>{submission.voteCount}pts</div>
            </div>
            <hr></hr>
          </div>
        );
      })}
    </div>
  );
};

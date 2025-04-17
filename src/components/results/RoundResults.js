import React from 'react';
import styles from './RoundResults.module.css';
import Image from 'next/image';

export const RoundResults = ({ currentUser, roundData, userProfiles }) => {
  const sortedSubmissions = [...(roundData.submissions || [])].sort(
    (a, b) => b.voteCount - a.voteCount
  );

  const userStyle = (submissionUid) => {
    return currentUser.uid === submissionUid ? styles.currentUser : '';
  };

  const getUserDetails = (uid) => {
    const user = userProfiles.find((user) => user.uid === uid);
    return {
      username: user?.username || 'Unknown User',
      profileImage: user?.profileImage || '/img/user.png',
    };
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Round Results</div>

      {sortedSubmissions.map((submission) => {
        const { username } = getUserDetails(submission.uid);

        return (
          <div key={submission.uid} className={styles.resultInfo}>
            <div className={styles.videoTitle}>{submission.videoTitle}</div>
            <div className={styles.resultRow}>
              <div
                className={`${styles.username} ${userStyle(submission.uid)}`}
              >
                Submitted by {username}
              </div>
              <div className={styles.votes}>{submission.voteCount}pts</div>
            </div>

            {/* Comments Section */}
            <div className={styles.commentsSection}>
              {submission.comments?.length > 0 ? (
                submission.comments
                  .filter((comment) => comment.uid !== submission.uid) // Filter out comments where comment.uid matches submission.uid
                  .sort((a, b) => b.vote - a.vote) // Sort comments by vote in descending order (1 to -1)
                  .map((comment, index) => {
                    const { username, profileImage } = getUserDetails(
                      comment.uid
                    );
                    return (
                      <div key={index} className={styles.comment}>
                        <Image
                          src={profileImage}
                          alt={`${username}'s profile`}
                          width={30}
                          height={30}
                          className={styles.profileImage}
                        />
                        <div className={styles.commentContent}>
                          <div className={styles.commentUsername}>
                            {username}
                          </div>
                          <div className={styles.commentText}>
                            {comment.comment}
                          </div>
                          <div
                            className={styles.commentVote}
                            style={{
                              color:
                                comment.vote === 1
                                  ? 'green'
                                  : comment.vote === -1
                                  ? 'red'
                                  : 'inherit',
                            }}
                          >
                            {comment.vote === 1
                              ? `+${comment.vote}`
                              : comment.vote}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className={styles.noComments}></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

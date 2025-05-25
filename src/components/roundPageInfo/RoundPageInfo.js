import React from 'react';
import styles from './RoundPageInfo.module.css';
import Image from 'next/image';
import { UserImageContainer } from '../userImageContainer/UserImageContainer';
import { status, stage } from '@/utils/status';

export const RoundPageInfo = ({
  currentUser,
  roundData,
  usersWhoVoted,
  usersWithSubmissions,
  stillPonderingUsers,
  onPlaylistClick,
  onSubmitClick,
}) => {
  const now = new Date();
  const formatDeadline = (deadline, type) => {
    const deadlineDate = new Date(deadline);

    const isToday = now.toDateString() === deadlineDate.toDateString();
    const isTomorrow =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).toDateString() === deadlineDate.toDateString();

    const dayName = deadlineDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });
    const monthDay = deadlineDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
    });

    if (isToday) {
      return `${type} due today at midnight`;
    } else if (isTomorrow) {
      return `${type} due tomorrow at midnight`;
    } else {
      return `${type} due ${dayName} ${monthDay} at midnight`;
    }
  };

  const voteDeadlinePassed = now > new Date(roundData.voteDeadline);

  return (
    <div className={styles.roundInfo}>
      <div className={styles.title}>Round {roundData.roundNumber}</div>
      <div className={styles.prompt}>{roundData.prompt}</div>
      <p>{formatDeadline(roundData.submissionDeadline, 'Submissions')}</p>
      <p>{formatDeadline(roundData.voteDeadline, 'Votes')}</p>

      <UserImageContainer
        title={roundData.roundStage === stage.VOTING ? 'Voted' : 'Submitted'}
        users={
          roundData.roundStage === stage.VOTING
            ? usersWhoVoted
            : usersWithSubmissions
        }
      />

      <UserImageContainer
        title={voteDeadlinePassed ? 'Missed Vote Deadline' : 'Still Pondering'}
        users={stillPonderingUsers}
      />

      {roundData.roundStage === stage.VOTING ? (
        <div className={styles.submit} onClick={onPlaylistClick}>
          <Image
            src="/img/playlist.svg"
            alt="playlist"
            width={50}
            height={50}
          />
          <div className={styles.label}>Listen to Playlist</div>
        </div>
      ) : (
        roundData.players.some((player) => player.userId === currentUser.uid) &&
        roundData.roundStatus !== status.PENDING && (
          <div className={styles.submit} onClick={onSubmitClick}>
            <Image
              src={
                roundData.submissions?.some(
                  (submission) => submission.uid === currentUser.uid
                )
                  ? '/img/resubmit.svg'
                  : '/img/share.svg'
              }
              alt="submit"
              width={50}
              height={50}
            />
            <div className={styles.label}>
              {roundData.submissions?.some(
                (submission) => submission.uid === currentUser.uid
              )
                ? 'Change Submission'
                : 'Submit Song'}
            </div>
          </div>
        )
      )}
    </div>
  );
};

import React from 'react';
import styles from './RoundPageInfo.module.css';
import Image from 'next/image';
import { UserImageContainer } from '../userImageContainer/UserImageContainer';
import { status, stage } from '@/utils/status';

export const RoundPageInfo = ({currentUser, roundData, usersWhoVoted, usersWithSubmissions, stillPonderingUsers, onPlaylistClick, onSubmitClick }) => {
  return (
    <div className={styles.roundInfo}>
      <div className={styles.title}>Round {roundData.roundNumber}</div>
      <div className={styles.prompt}>{roundData.prompt}</div>
      <p>
        Submission Deadline:{' '}
        {new Date(roundData.submissionDeadline).toLocaleDateString()}
      </p>
      <p>
        Vote Deadline: {new Date(roundData.voteDeadline).toLocaleDateString()}
      </p>

      <UserImageContainer
        title={
          roundData.roundStage === stage.VOTING
            ? 'Voted'
            : 'Submitted'
        }
        users={
          roundData.roundStage === stage.VOTING
            ? usersWhoVoted
            : usersWithSubmissions
        }
      />

      <UserImageContainer title="Still Pondering" users={stillPonderingUsers} />

      {roundData.roundStage === stage.VOTING ? (
        // Show "Listen to Playlist" button if the current date is past the submission deadline
        // OR if the number of submissions equals the number of players
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
        // Show "Submit Song" button if the conditions above are not met
        roundData.players.some((player) => player.userId === currentUser.uid) &&
        roundData.roundStatus !== status.PENDING && (
          <div
            className={styles.submit}
            onClick={onSubmitClick}
          >
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

import React, { useState } from 'react';
import styles from './VoteCard.module.css';
import SongCard from '../songCard/SongCard';
import Button from '@/components/button/Button';
import {
  updateRoundSubmissions,
  incrementUserVotes,
  updateVoteDeadline,
  fetchRoundData,
} from '@/firebase';
import { triggerCronJob } from '@/utils/cron';

const VoteCard = ({
  submissions,
  legionId,
  roundId,
  currentUser,
  onVotesSubmitted,
  stillPonderingUsers,
  upVotesPerRound,
  downVotesPerRound,
}) => {
  const [votes, setVotes] = useState(() =>
    submissions.reduce((acc, submission) => {
      acc[submission.uid] = 0; // Initialize votes for each submission
      return acc;
    }, {})
  );

  const [comments, setComments] = useState(() =>
    submissions.reduce((acc, submission) => {
      acc[submission.uid] = ''; // Initialize comments for each submission
      return acc;
    }, {})
  );

  const handleVote = (uid, type) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [uid]:
        type === 'positive'
          ? prevVotes[uid] === 1
            ? 0
            : 1
          : prevVotes[uid] === -1
          ? 0
          : -1,
    }));
  };

  const handleCommentChange = (uid, comment) => {
    setComments((prevComments) => ({
      ...prevComments,
      [uid]: comment, // Update the comment for the correct submission
    }));
  };

  // Calculate the number of upvotes and downvotes
  const upVotesCount = Object.values(votes).filter((vote) => vote === 1).length;
  const downVotesCount = Object.values(votes).filter(
    (vote) => vote === -1
  ).length;

  // Update the condition to enable the submit button
  const canSubmitVotes =
    upVotesCount === upVotesPerRound && downVotesCount === downVotesPerRound;

  const handleSubmitVotes = async () => {
    try {
      // Fetch the latest round data to ensure up-to-date submissions
      const latestRoundDataResult = await fetchRoundData(legionId, roundId);
      if (!latestRoundDataResult.success) {
        console.error(
          'Error fetching the latest round data:',
          latestRoundDataResult.error
        );
        return;
      }
      const latestSubmissions = latestRoundDataResult.round.submissions || [];

      // Merge the latest submissions with the current votes and comments
      const updatedSubmissions = latestSubmissions.map((submission) => ({
        ...submission,
        voteCount: (submission.voteCount || 0) + (votes[submission.uid] || 0),
        comments: [
          ...(submission.comments || []), // Preserve existing comments
          {
            uid: currentUser.uid,
            comment: comments[submission.uid]?.trim() || '', // Save the comment even if it's empty
            vote: votes[submission.uid] || 0, // Include the vote (1, -1, or 0)
          },
        ],
      }));

      // Save the updated submissions to Firestore
      const result = await updateRoundSubmissions(
        legionId,
        roundId,
        updatedSubmissions,
        currentUser.uid
      );

      if (result.success) {
        await incrementUserVotes(currentUser.uid);

        // Check if the current user is the last in stillPonderingUsers
        if (
          stillPonderingUsers.length === 1 &&
          stillPonderingUsers[0].uid === currentUser.uid
        ) {
          const today = new Date().toISOString();
          await updateVoteDeadline(legionId, roundId, today);

          // Trigger the cron job
          await triggerCronJob();
        }

        if (onVotesSubmitted) {
          onVotesSubmitted();
        }
      } else {
        console.error('Failed to submit votes:', result.error);
      }
    } catch (error) {
      console.error('Error submitting votes:', error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.carousel}>
        {submissions.map((submission, index) => (
          <SongCard
            key={submission.uid}
            youtubeUrl={submission.youtubeUrl}
            videoTitle={submission.videoTitle}
            vote={votes[submission.uid]}
            onVote={(voteType) => handleVote(submission.uid, voteType)}
            isUserSubmission={submission.uid === currentUser.uid}
            onCommentChange={(comment) =>
              handleCommentChange(submission.uid, comment)
            }
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <div className={styles.voteRequirements}>
          Upvotes: {upVotesCount}/{upVotesPerRound} | Downvotes:{' '}
          {downVotesCount}/{downVotesPerRound}
        </div>
        <div className={styles.button}>
          <Button
            onClick={handleSubmitVotes}
            disabled={!canSubmitVotes}
            variant={!canSubmitVotes ? 'disabled' : 'blue'}
          >
            Submit Votes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoteCard;

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
  stillPonderingUsers, // Pass stillPonderingUsers as a prop
}) => {
  const [votes, setVotes] = useState(submissions.map(() => 0));

  const handleVote = (index, type) => {
    setVotes((prevVotes) => {
      const updatedVotes = [...prevVotes];
      if (type === 'positive') {
        updatedVotes[index] = updatedVotes[index] === 1 ? 0 : 1;
      } else if (type === 'negative') {
        updatedVotes[index] = updatedVotes[index] === -1 ? 0 : -1;
      }
      return updatedVotes;
    });
  };

  const canSubmitVotes = votes.some((vote) => vote !== 0);

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

      // Merge the latest submissions with the current votes
      const updatedSubmissions = latestSubmissions.map((submission, index) => ({
        ...submission,
        voteCount: (submission.voteCount || 0) + (votes[index] || 0),
      }));

      // Save the updated submissions
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
            vote={votes[index]}
            onVote={(voteType) => handleVote(index, voteType)}
            isUserSubmission={submission.uid === currentUser.uid}
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button onClick={handleSubmitVotes} disabled={!canSubmitVotes}>
          Submit Votes
        </Button>
      </div>
    </div>
  );
};

export default VoteCard;

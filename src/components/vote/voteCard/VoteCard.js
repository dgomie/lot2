import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import styles from './VoteCard.module.css';
import SongCard from '../songCard/SongCard';
import Button from '@/components/button/Button';
import { updateRoundSubmissions } from '@/firebase';

const VoteCard = ({
  submissions,
  legionId,
  roundId,
  currentUser,
  onVotesSubmitted,
}) => {
  const [votes, setVotes] = useState(submissions.map(() => 0)); // Initialize all votes to 0
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

  const canSubmitVotes = votes.some((vote) => vote !== 0); // Allow submission if any vote is non-zero

  const handleSubmitVotes = async () => {
    const updatedSubmissions = submissions.map((submission, index) => ({
      ...submission,
      voteCount: (submission.voteCount || 0) + votes[index], // Add the vote to the submission's voteCount
    }));

    try {
      const result = await updateRoundSubmissions(
        legionId,
        roundId,
        updatedSubmissions,
        currentUser.uid // Pass the current user's UID
      );

      if (result.success) {
        console.log('Votes successfully submitted');
        if (onVotesSubmitted) {
          onVotesSubmitted(); // Call the callback function to refresh the round data
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
            vote={votes[index]} // Pass the vote for this submission
            onVote={(voteType) => handleVote(index, voteType)} // Use the index to update the vote
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

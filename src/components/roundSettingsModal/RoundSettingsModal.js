import React, { useMemo, useState } from 'react';
import styles from './RoundSettingsModal.module.css';
import Input from '@/components/input/Input';
import Button from '@/components/button/Button';
import Image from 'next/image';
import { musicLeaguePrompts } from '@/data/defaultPrompts'; // Import prompts

const RoundSettingsModal = ({
  editableRoundData,
  originalRoundData,
  setEditableRoundData,
  onSave,
  onCancel,
}) => {
  const [submissionError, setSubmissionError] = useState('');
  const [voteError, setVoteError] = useState('');

  // Function to generate a random prompt
  const handleShufflePrompt = () => {
    if (musicLeaguePrompts.length === 0) {
      setEditableRoundData({
        ...editableRoundData,
        prompt: 'No prompts available', // Fallback prompt
      });
      return;
    }
    const randomPrompt =
      musicLeaguePrompts[Math.floor(Math.random() * musicLeaguePrompts.length)];
    setEditableRoundData({
      ...editableRoundData,
      prompt: randomPrompt,
    });
  };

  const hasChanges = useMemo(() => {
    if (!editableRoundData || !originalRoundData) return false;
    return (
      editableRoundData.prompt !== originalRoundData.prompt ||
      editableRoundData.submissionDeadline !==
        originalRoundData.submissionDeadline ||
      editableRoundData.voteDeadline !== originalRoundData.voteDeadline
    );
  }, [editableRoundData, originalRoundData]);

  const handleSubmissionDeadlineChange = (e) => {
    const newSubmissionDeadline = new Date(e.target.value).toISOString();
    const now = new Date().toISOString();

    if (newSubmissionDeadline <= now) {
      setSubmissionError('Submission deadline must be a future date.');
      return;
    }

    if (
      editableRoundData.voteDeadline &&
      newSubmissionDeadline >= editableRoundData.voteDeadline
    ) {
      setSubmissionError('');
      setVoteError('Vote deadline must be after the submission deadline.');
    } else {
      setVoteError('');
    }

    setSubmissionError('');
    setEditableRoundData({
      ...editableRoundData,
      submissionDeadline: newSubmissionDeadline,
    });
  };

  const handleVoteDeadlineChange = (e) => {
    const newVoteDeadline = new Date(e.target.value).toISOString();

    if (newVoteDeadline <= editableRoundData.submissionDeadline) {
      setVoteError('Vote deadline must be after the submission deadline.');
      return;
    }

    setVoteError('');
    setEditableRoundData({
      ...editableRoundData,
      voteDeadline: newVoteDeadline,
    });
  };

  if (!editableRoundData) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.title}>Edit Round Settings</div>

        <Input
          id="prompt"
          name="prompt"
          label="Prompt"
          type="text"
          value={editableRoundData.prompt}
          onChange={(e) =>
            setEditableRoundData({
              ...editableRoundData,
              prompt: e.target.value,
            })
          }
          required
        />
        <Button variant="aquamarine" onClick={handleShufflePrompt}>
          <div className={styles.randomizeButtonContent}>
            <Image
              src="/img/shuffle.svg"
              height={20}
              width={20}
              alt="shuffle"
              className={styles.shuffleIcon}
            />
            Randomize Prompt
          </div>
        </Button>

        <Input
          id="submissionDeadline"
          name="submissionDeadline"
          label="Submission Deadline"
          type="datetime-local"
          value={new Date(editableRoundData.submissionDeadline)
            .toISOString()
            .slice(0, 16)}
          onChange={handleSubmissionDeadlineChange}
          required
        />
        {submissionError && (
          <div className={styles.errorMessage}>{submissionError}</div>
        )}
        <Input
          id="voteDeadline"
          name="voteDeadline"
          label="Vote Deadline"
          type="datetime-local"
          value={new Date(editableRoundData.voteDeadline)
            .toISOString()
            .slice(0, 16)}
          onChange={handleVoteDeadlineChange}
          required
        />
        {voteError && <div className={styles.errorMessage}>{voteError}</div>}
        <div className={styles.modalActions}>
          <Button
            onClick={onSave}
            variant={
              !hasChanges || submissionError || voteError ? 'disabled' : 'blue'
            }
            disabled={!hasChanges || submissionError || voteError}
          >
            Save
          </Button>
          <Button onClick={onCancel} variant="red">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoundSettingsModal;

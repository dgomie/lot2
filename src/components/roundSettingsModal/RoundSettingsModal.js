import React, { useMemo } from 'react';
import styles from './RoundSettingsModal.module.css';
import Input from '@/components/input/Input';
import Button from '@/components/button/Button';

const RoundSettingsModal = ({
  editableRoundData,
  originalRoundData, // Pass the original round data for comparison
  setEditableRoundData,
  onSave,
  onCancel,
}) => {
  // Check if there are any changes between editableRoundData and originalRoundData
  const hasChanges = useMemo(() => {
    if (!editableRoundData || !originalRoundData) return false;
    return (
      editableRoundData.prompt !== originalRoundData.prompt ||
      editableRoundData.submissionDeadline !==
        originalRoundData.submissionDeadline ||
      editableRoundData.voteDeadline !== originalRoundData.voteDeadline
    );
  }, [editableRoundData, originalRoundData]);

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
        <Input
          id="submissionDeadline"
          name="submissionDeadline"
          label="Submission Deadline"
          type="datetime-local"
          value={new Date(editableRoundData.submissionDeadline)
            .toISOString()
            .slice(0, 16)}
          onChange={(e) =>
            setEditableRoundData({
              ...editableRoundData,
              submissionDeadline: new Date(e.target.value).toISOString(),
            })
          }
          required
        />
        <Input
          id="voteDeadline"
          name="voteDeadline"
          label="Vote Deadline"
          type="datetime-local"
          value={new Date(editableRoundData.voteDeadline)
            .toISOString()
            .slice(0, 16)}
          onChange={(e) =>
            setEditableRoundData({
              ...editableRoundData,
              voteDeadline: new Date(e.target.value).toISOString(),
            })
          }
          required
        />
        <div className={styles.modalActions}>
          <Button onClick={onSave} variant={!hasChanges ? 'disabled' : 'blue'} disabled={!hasChanges}>
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

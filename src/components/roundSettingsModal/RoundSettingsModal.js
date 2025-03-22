import React from 'react';
import styles from './RoundSettingsModal.module.css';

const RoundSettingsModal = ({
  editableRoundData,
  setEditableRoundData,
  onSave,
  onCancel,
}) => {
  if (!editableRoundData) return null; // Ensure data is loaded before rendering

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Round Settings</h2>
        <label>
          Prompt:
          <input
            type="text"
            value={editableRoundData.prompt}
            onChange={(e) =>
              setEditableRoundData({
                ...editableRoundData,
                prompt: e.target.value,
              })
            }
          />
        </label>
        <label>
          Submission Deadline:
          <input
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
          />
        </label>
        <label>
          Vote Deadline:
          <input
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
          />
        </label>
        <div className={styles.modalActions}>
          <button onClick={onSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RoundSettingsModal;
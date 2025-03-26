import React, { useState } from 'react';
import styles from './SubmitModal.module.css';

const SubmitModal = ({ onClose, onSubmit }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = () => {
    if (youtubeUrl.trim()) {
      onSubmit(youtubeUrl);
      onClose();
    } else {
      alert('Please enter a valid YouTube URL.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Submit YouTube URL</h2>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className={styles.input}
        />
        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Submit
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;

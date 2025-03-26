import React, { useState } from 'react';
import styles from './SubmitModal.module.css';
import Input from '../input/Input';
import Button from '../button/Button';

const SubmitModal = ({ onClose, onSubmit }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const isValidYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleInputChange = (e) => {
    setYoutubeUrl(e.target.value);
    setIsDirty(true);
  };

  const handleSubmit = () => {
    if (youtubeUrl.trim() && isValidYoutubeUrl(youtubeUrl)) {
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
        <Input type="text" value={youtubeUrl} onChange={handleInputChange} />
        <div className={styles.actions}>
          <Button
            onClick={handleSubmit}
            variant={
              youtubeUrl.trim() && isDirty && isValidYoutubeUrl(youtubeUrl)
                ? 'blue'
                : 'disabled'
            }
            disabled={
              !youtubeUrl.trim() || !isDirty || !isValidYoutubeUrl(youtubeUrl)
            }
          >
            Submit
          </Button>
          <Button onClick={onClose} variant="red">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;

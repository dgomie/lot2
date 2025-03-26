'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchRoundData, saveRoundData } from '@/firebase';
import styles from './RoundPage.module.css';
import Image from 'next/image';
import RoundSettingsModal from '@/components/roundSettingsModal/RoundSettingsModal';
import withAuth from '@/hoc/withAuth';
import SubmitModal from '@/components/submitModal/SubmitModal';

const RoundPage = ({ currentUser }) => {
  const router = useRouter();
  const params = useParams();
  const { legionId, roundId } = params;

  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableRoundData, setEditableRoundData] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchRound = async () => {
    const result = await fetchRoundData(legionId, roundId);
    if (result.success) {
      setRoundData(result.round);
      setEditableRoundData(result.round);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  const handleSaveChanges = async () => {
    const result = await saveRoundData(legionId, roundId, editableRoundData);
    if (result.success) {
      setRoundData(editableRoundData);
      setIsModalOpen(false);
    } else {
      console.error(result.error);
    }
  };

  useEffect(() => {
    if (legionId && roundId) {
      fetchRound();
    }
  }, [legionId, roundId]);

  if (loading) {
    return <div className={styles.roundPage}>Loading...</div>;
  }

  if (!roundData) {
    return <div className={styles.roundPage}>Round not found.</div>;
  }

  const handleSubmitUrl = async (youtubeUrl) => {
    if (!currentUser) return;

    const newSubmission = {
      uid: currentUser.uid,
      youtubeUrl,
      voteCount: 0,
    };

    const existingSubmissions = roundData.submissions || [];
    const updatedSubmissions = existingSubmissions.map((submission) =>
      submission.uid === currentUser.uid ? newSubmission : submission
    );

    const isNewSubmission = !existingSubmissions.some(
      (submission) => submission.uid === currentUser.uid
    );
    if (isNewSubmission) {
      updatedSubmissions.push(newSubmission);
    }

    const result = await saveRoundData(legionId, roundId, {
      ...roundData,
      submissions: updatedSubmissions,
    });

    if (result.success) {
      setRoundData((prev) => ({
        ...prev,
        submissions: updatedSubmissions,
      }));
    } else {
      console.error(result.error);
    }
  };

  return (
    <div className={styles.roundPage}>
      <div className={styles.header}>
        <div
          className={styles.backArrow}
          onClick={() => router.push(`/legions/${legionId}`)}
        >
          <Image
            src={'/img/arrow-back.svg'}
            width={25}
            height={25}
            alt="Back"
          />
        </div>
        {currentUser &&
          roundData &&
          currentUser.uid === roundData.legionAdmin && (
            <div
              className={styles.gearIcon}
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src={'/img/gear.svg'}
                width={25}
                height={25}
                alt="settings"
              />
            </div>
          )}
      </div>
      <div className={styles.roundInfo}>
        <div className={styles.title}>Round {roundData.roundNumber}</div>
        <div className={styles.prompt}>{roundData.prompt}</div>
        <p>
          Submission Deadline:{' '}
          {new Date(roundData.submissionDeadline).toLocaleString()}
        </p>
        <p>
          Vote Deadline: {new Date(roundData.voteDeadline).toLocaleString()}
        </p>
        <p>Status: {roundData.isRoundComplete ? 'Complete' : 'In Progress'}</p>

        <div
          className={styles.submit}
          onClick={() => setIsSubmitModalOpen(true)}
        >
          <Image src="/img/share.svg" alt="submit" width={50} height={50} />
          <div className={styles.label}>Submit Song</div>
        </div>
      </div>

      {isModalOpen && (
        <RoundSettingsModal
          editableRoundData={editableRoundData}
          originalRoundData={roundData}
          setEditableRoundData={setEditableRoundData}
          onSave={handleSaveChanges}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

      {isSubmitModalOpen && (
        <SubmitModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleSubmitUrl}
        />
      )}
    </div>
  );
};

export default withAuth(RoundPage);

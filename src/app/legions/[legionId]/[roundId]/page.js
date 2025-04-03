'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchRoundData, saveRoundData } from '@/firebase';
import styles from './RoundPage.module.css';
import Image from 'next/image';
import RoundSettingsModal from '@/components/roundSettingsModal/RoundSettingsModal';
import withAuth from '@/hoc/withAuth';
import SubmitModal from '@/components/submitModal/SubmitModal';
import VoteCard from '@/components/vote/voteCard/VoteCard';

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

  const generatePlaylist = () => {
    if (
      !roundData ||
      !roundData.submissions ||
      roundData.submissions.length === 0
    ) {
      alert('No submissions available to generate a playlist.');
      return;
    }

    const videoIds = roundData.submissions
      .map((submission) => {
        const url = submission.youtubeUrl;
        const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      })
      .filter((id) => id !== null);

    if (videoIds.length === 0) {
      alert('No valid YouTube video IDs found.');
      return;
    }

    for (let i = videoIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videoIds[i], videoIds[j]] = [videoIds[j], videoIds[i]];
    }

    const playlistUrl = `http://www.youtube.com/watch_videos?video_ids=${videoIds.join(
      ','
    )}`;

    window.location.href = playlistUrl;
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

  const randomizedSubmissions = [...(roundData.submissions || [])];
  for (let i = randomizedSubmissions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedSubmissions[i], randomizedSubmissions[j]] = [
      randomizedSubmissions[j],
      randomizedSubmissions[i],
    ];
  }

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
        <p>Status: {roundData.roundStatus}</p>

        {new Date() > new Date(roundData.submissionDeadline) ? (
          // Show "Listen to Playlist" button if the current date is past the submission deadline
          // OR if the number of submissions equals the number of players
          <div className={styles.submit} onClick={generatePlaylist}>
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
          <div
            className={styles.submit}
            onClick={() => setIsSubmitModalOpen(true)}
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
        )}
      </div>

      {new Date() > new Date(roundData.submissionDeadline) &&
        new Date() < new Date(roundData.voteDeadline) && (
          <VoteCard submissions={randomizedSubmissions} />
        )}

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

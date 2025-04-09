'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchRoundData,
  saveRoundData,
  getUserProfile,
  incrementUserSongs,
} from '@/firebase';
import styles from './RoundPage.module.css';
import Image from 'next/image';
import RoundSettingsModal from '@/components/roundSettingsModal/RoundSettingsModal';
import withAuth from '@/hoc/withAuth';
import SubmitModal from '@/components/submitModal/SubmitModal';
import VoteCard from '@/components/vote/voteCard/VoteCard';
import { UserImageContainer } from '@/components/userImageContainer/UserImageContainer';
import { RoundResults } from '@/components/results/RoundResults';
import { status } from '@/utils/status';
import { RoundPageHeader } from '@/components/roundPageHeader/RoundPageHeader';
import { VotesSubmitted } from '@/components/vote/votesSubmitted/VotesSubmitted';
import { RoundPageInfo } from '@/components/roundPageInfo/RoundPageInfo';

const RoundPage = ({ currentUser }) => {
  const router = useRouter();
  const params = useParams();
  const { legionId, roundId } = params;

  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableRoundData, setEditableRoundData] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [usersWithSubmissions, setUsersWithSubmissions] = useState([]);
  const [usersWhoVoted, setUsersWhoVoted] = useState([]);
  const [stillPonderingUsers, setStillPonderingUsers] = useState([]);

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

  const fetchUsersByUids = async (uids) => {
    const userIds = uids.map((uid) =>
      typeof uid === 'object' ? uid.userId : uid
    );

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const user = await getUserProfile(userId);
        return {
          uid: userId,
          profileImage: user?.profileImg || '/img/user.png',
          username: user?.username,
        };
      })
    );
    return users;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!roundData) return;

      const submissionUids = roundData.submissions?.map((s) => s.uid) || [];
      const playersVoted = roundData.playersVoted || [];
      const allPlayerUids = roundData.players.map((player) =>
        typeof player === 'object' ? player.userId : player
      );

      const now = new Date();
      const isSubmissionPhase = now <= new Date(roundData.submissionDeadline);

      // Calculate still pondering users
      const stillPonderingUids = allPlayerUids.filter((uid) =>
        isSubmissionPhase
          ? !submissionUids.includes(uid)
          : !playersVoted.includes(uid)
      );

      // Fetch user profiles for still pondering users
      const [
        fetchedUsersWithSubmissions,
        fetchedUsersWhoVoted,
        fetchedStillPonderingUsers,
      ] = await Promise.all([
        fetchUsersByUids(submissionUids),
        fetchUsersByUids(playersVoted),
        fetchUsersByUids(stillPonderingUids),
      ]);

      setUsersWithSubmissions(fetchedUsersWithSubmissions);
      setUsersWhoVoted(fetchedUsersWhoVoted);
      setStillPonderingUsers(fetchedStillPonderingUsers);
    };

    fetchUsers();
  }, [roundData]);

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

  const refreshRoundData = async () => {
    setLoading(true);
    await fetchRound();
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

    const videoId = youtubeUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) {
      return 'Invalid YouTube URL.';
    }

    let videoTitle = 'Unknown Video';
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        videoTitle = data.items[0].snippet.title;
      }
    } catch (error) {
      console.error('Error fetching video title:', error);
      return 'Error fetching video details. Please try again.';
    }

    // Fetch the latest roundData to avoid overwriting other submissions
    const latestRoundDataResult = await fetchRoundData(legionId, roundId);
    if (!latestRoundDataResult.success) {
      console.error(latestRoundDataResult.error);
      return 'Error fetching the latest round data. Please try again.';
    }
    const latestRoundData = latestRoundDataResult.round;

    // Check if the video ID and title already exist in submissions
    const existingSubmission = latestRoundData.submissions?.find(
      (submission) =>
        submission.youtubeUrl.includes(videoId) ||
        submission.videoTitle === videoTitle
    );

    if (existingSubmission) {
      return 'Someone already submitted this song. Your next choice is probably better anyway!';
    }

    const newSubmission = {
      uid: currentUser.uid,
      youtubeUrl,
      videoTitle,
      voteCount: 0,
    };

    const existingSubmissions = latestRoundData.submissions || [];
    const updatedSubmissions = existingSubmissions.map((submission) =>
      submission.uid === currentUser.uid ? newSubmission : submission
    );

    const isNewSubmission = !existingSubmissions.some(
      (submission) => submission.uid === currentUser.uid
    );
    if (isNewSubmission) {
      updatedSubmissions.push(newSubmission);
      await incrementUserSongs(currentUser.uid);
    }

    const result = await saveRoundData(legionId, roundId, {
      ...latestRoundData,
      submissions: updatedSubmissions,
    });

    if (result.success) {
      setRoundData((prev) => ({
        ...prev,
        submissions: updatedSubmissions,
      }));
      setLoading(true);
      await fetchRound();
      return null; // No error
    } else {
      console.error(result.error);
      return 'Error saving submission. Please try again.';
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

  const onBackClick = () => {
    router.push(`/legions/${legionId}`);
  };

  const onSettingsClick = () => {
    setIsModalOpen(true);
  };

  const onSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  const onPlaylistClick = () => {
    generatePlaylist();
  };

  return (
    <div className={styles.roundPage}>
      <RoundPageHeader
        currentUser={currentUser}
        legionId={legionId}
        roundData={roundData}
        onBackClick={onBackClick}
        onSettingsClick={onSettingsClick}
      />
      <RoundPageInfo
        currentUser={currentUser}
        roundData={roundData}
        usersWhoVoted={usersWhoVoted}
        usersWithSubmissions={usersWithSubmissions}
        stillPonderingUsers={stillPonderingUsers}
        onPlaylistClick={onPlaylistClick}
        onSubmitClick={onSubmitClick}
      />
      
      {new Date() > new Date(roundData.submissionDeadline) &&
        new Date() <= new Date(roundData.voteDeadline) &&
        roundData.roundStatus !== 'completed' &&
        roundData.players.some(
          (player) => player.userId === currentUser.uid
        ) && (
          <>
            {roundData.playersVoted?.includes(currentUser.uid) ? (
              <VotesSubmitted />
            ) : (
              <VoteCard
                submissions={randomizedSubmissions.map((submission) => ({
                  ...submission,
                  videoTitle: submission.videoTitle,
                }))}
                legionId={legionId}
                roundId={roundId}
                currentUser={currentUser}
                onVotesSubmitted={refreshRoundData}
                players={roundData?.players}
                stillPonderingUsers={stillPonderingUsers}
              />
            )}
          </>
        )}

      {roundData.roundStatus === 'completed' && (
        <RoundResults
          currentUser={currentUser}
          roundData={roundData}
          userProfiles={usersWithSubmissions}
        />
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

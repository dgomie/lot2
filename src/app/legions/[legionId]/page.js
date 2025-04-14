'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { fetchLegionData } from '@/firebase'; // Import the function
import Loader from '@/components/loader/Loader';
import withAuth from '@/hoc/withAuth';
import Players from '@/components/players/Players';
import LegionHeader from '@/components/legionHeader/LegionHeader';
import RoundCard from '@/components/roundCard/RoundCard';
import styles from './LegionPage.module.css';
import { StandingsCard } from '@/components/standingsCard/StandingsCard';
import { AddRoundCard } from '@/components/addRoundCard/AddRoundCard';

const LegionPage = () => {
  const params = useParams();
  const legionId = params.legionId;
  const [legionData, setLegionData] = useState(null);
  const [activeTab, setActiveTab] = useState('players');

  const fetchData = async () => {
    const result = await fetchLegionData(legionId);
    if (result.success) {
      setLegionData(result.data);
    } else {
      console.error(result.error);
    }
  };

  const handlePlayerAdded = ({ userId, username, profileImg }) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: [
        ...prevData.players,
        { userId: userId, username: username, profileImg: profileImg },
      ],
    }));
  };

  const handlePlayerRemoved = (userId) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: prevData.players.filter((player) => player.userId !== userId),
    }));
  };

  useEffect(() => {
    if (legionId) {
      fetchData();
    }
  }, [legionId]);

  if (!legionData) {
    return <Loader />;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerContainer}>
        <LegionHeader
          legionData={legionData}
          legionId={legionId}
          onPlayerAdded={handlePlayerAdded}
          onPlayerRemoved={handlePlayerRemoved}
        />
      </div>
      <div className={styles.tabCentering}>
      <div className={styles.tabContainer} data-active-tab={activeTab}>
        <button
          className={`${styles.tabButton1} ${
            activeTab === 'players' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button
          className={`${styles.tabButton2} ${
            activeTab === 'standings' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
      </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'players' && (
          <div className={styles.playersContainer}>
            <Players
              legionPlayers={legionData.players}
              legionAdmin={legionData.legionAdmin.userId}
            />
          </div>
        )}
        {activeTab === 'standings' && (
          <StandingsCard
            legionStatus= {legionData.isActive}
            standings={legionData.standings}
            legionPlayers={legionData.players}
          />
        )}
      </div>

      <div className={styles.currentRound}>
        <div className={styles.title}>Current Round</div>
        {legionData.currentRound > legionData.rounds.length ? (
          <div className={styles.completedMessage}>Legion Completed</div>
        ) : (
          <RoundCard
            round={legionData.rounds[legionData.currentRound - 1]}
            legionId={legionId}
          />
        )}
      </div>
      <div className={styles.allRoundsContainer}>
        <div className={styles.allRoundsTitle}>All Rounds</div>
        <div className={`${styles.container} scroll-1`}>
          {legionData.rounds.map((round) => (
            <RoundCard
              key={round.roundNumber}
              round={round}
              legionId={legionId}
            />
          ))}
          <AddRoundCard legionId={legionId} rounds={legionData.rounds}/>
        </div>
      </div>

    </div>
  );
};

export default withAuth(LegionPage);

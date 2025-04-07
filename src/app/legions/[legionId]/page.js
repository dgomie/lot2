'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { fetchLegionData, updateLegionStandings } from '@/firebase'; // Import the function
import Loader from '@/components/loader/Loader';
import withAuth from '@/hoc/withAuth';
import Players from '@/components/players/Players';
import LegionHeader from '@/components/legionHeader/LegionHeader';
import RoundCard from '@/components/roundCard/RoundCard';
import styles from './LegionPage.module.css';
import { StandingsCard } from '@/components/standingsCard/StandingsCard';

const LegionPage = () => {
  const params = useParams();
  const legionId = params.legionId;
  const [legionData, setLegionData] = useState(null);

  const fetchData = async () => {
    const result = await fetchLegionData(legionId);
    if (result.success) {
      setLegionData(result.data);
    } else {
      console.error(result.error);
    }
  };

  const handlePlayerAdded = (userId) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: [...prevData.players, userId],
    }));
  };

  const handlePlayerRemoved = (userId) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: prevData.players.filter((player) => player !== userId),
    }));
  };

  // const handleTestStandingsUpdate = async () => {
  //   try {
  //     const result = await updateLegionStandings(legionId);
  //     if (result.success) {
  //       console.log('Standings updated successfully:', result.standings);
  //     } else {
  //       console.error('Error updating standings:', result.error);
        
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
     
  //   }
  // };

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
      <div className={styles.playersContainer}>
        <Players
          legionPlayers={legionData.players}
          legionAdmin={legionData.legionAdmin}
        />
      </div>

      <StandingsCard standings={legionData.standings} />

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
        </div>
      </div>

     
      {/* <button
        className={styles.testButton}
        onClick={handleTestStandingsUpdate}
      >
        Test Update Standings
      </button> */}
    </div>
  );
};

export default withAuth(LegionPage);
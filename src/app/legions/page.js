'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import DashboardCard from '@/components/dashboardCard/DashboardCard';
import { fetchLegions } from '@/firebase';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader/Loader';
import styles from './Legions.module.css';
import withAuth from '@/hoc/withAuth';
import Button from '@/components/button/Button';
import { DashboardHeader } from '@/components/dashboardHeader/DashboardHeader';

const Legions = ({ currentUser }) => {
  const [legions, setLegions] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const loadLegions = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      const { legions: newLegions, lastVisibleDoc } = await fetchLegions(
        lastVisible
      );

      setLegions((prevLegions) => [...prevLegions, ...newLegions]);
      setLastVisible(lastVisibleDoc);
      setHasMore(newLegions.length >= 5);
      setLoading(false);
      isFetching.current = false;
    };

    loadLegions();
  }, []);

  const handleCardClick = (legionId) => {
    router.push(`/legions/${legionId}`);
  };

  const handleCreateLegion = () => {
    router.push('/create-legion');
  };

  const loadMoreLegions = async () => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    setLoading(true);
    const { legions: newLegions, lastVisibleDoc } = await fetchLegions(
      lastVisible
    );

    setLegions((prevLegions) => [...prevLegions, ...newLegions]);
    setLastVisible(lastVisibleDoc);
    setHasMore(newLegions.length >= 5);
    setLoading(false);
    isFetching.current = false;
  };

  return (
    <>
      <div className={styles.mobileHeader}>
        <DashboardHeader currentUser={currentUser} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.createLegionButton}>
          <Button variant="blue" onClick={handleCreateLegion}>
            Create a Legion
          </Button>
        </div>
        <div className={styles.title}>Explore Active Legions</div>

        <div className={styles.mainContainer}>
          <div className={styles.legionsContainer}>
            {legions.map((legion, index) => (
              <DashboardCard
                key={legion.id}
                legionName={legion.legionName}
                legionDescription={legion.legionDescription}
                players={legion.players}
                maxNumPlayers={legion.maxNumPlayers}
                numRounds={legion.numRounds}
                currentRound={legion.currentRound}
                onClick={() => {
                  handleCardClick(legion.id);
                }}
              />
            ))}
            {loading && <Loader />}
            {!loading && hasMore && (
              <div className={styles.buttonContainer}>
                <Button onClick={loadMoreLegions} variant="transparentWhite">
                  Load More Legions
                </Button>
              </div>
            )}
            {!loading && !hasMore && (
              <div className={styles.noneLeft}>
                No more legions left to load
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Legions);

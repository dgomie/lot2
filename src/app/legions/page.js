'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import DashboardCard from '@/components/dashboardCard/DashboardCard';
import { fetchLegions } from '@/firebase';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader/Loader';
import styles from './Legions.module.css';
import withAuth from '@/hoc/withAuth';

const Legions = () => {
  const [legions, setLegions] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
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
      console.log('Fetched legions:', newLegions);
      setLegions((prevLegions) => [...prevLegions, ...newLegions]);
      setLastVisible(lastVisibleDoc);
      setHasMore(newLegions.length > 0);
      setLoading(false);
      isFetching.current = false;
    };

    loadLegions();
  }, []);

  const handleCardClick = (legionId) => {
    router.push(`/legions/${legionId}`);
  };

  const lastLegionElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const loadMoreLegions = async () => {
            if (isFetching.current) return;
            isFetching.current = true;
            setLoading(true);
            const { legions: newLegions, lastVisibleDoc } = await fetchLegions(
              lastVisible
            );
            console.log('Fetched more legions:', newLegions);
            setLegions((prevLegions) => [...prevLegions, ...newLegions]);
            setLastVisible(lastVisibleDoc);
            setHasMore(newLegions.length > 0);
            setLoading(false);
            isFetching.current = false;
          };

          loadMoreLegions();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, lastVisible, hasMore]
  );

  return (
    <div className={styles.mainContainer}>
      {legions.map((legion, index) => {
        if (legions.length === index + 1) {
          return (
            <div
              ref={lastLegionElementRef}
              key={legion.id}
            >
              <DashboardCard
                legionName={legion.legionName}
                legionDescription={legion.legionDescription}
                numPlayers={legion.numPlayers}
                maxNumPlayers={legion.maxNumPlayers}
                numRounds={legion.numRounds}
                onClick={() => {
                  handleCardClick(legion.id);
                }}
              />
            </div>
          );
        } else {
          return (
            <DashboardCard
              key={legion.id}
              legionName={legion.legionName}
              legionDescription={legion.legionDescription}
              numPlayers={legion.numPlayers}
              maxNumPlayers={legion.maxNumPlayers}
              numRounds={legion.numRounds}
              onClick={() => {
                handleCardClick(legion.id);
              }}
            />
          );
        }
      })}
      {loading && <Loader />}
    </div>
  );
};

export default withAuth(Legions);

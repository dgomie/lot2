import React from 'react';
import styles from './DashboardCard.module.css';
import Image from 'next/image';

const DashboardCard = ({
  legionName,
  legionDescription,
  players,
  maxNumPlayers,
  numRounds,
  currentRound,
  onClick,
}) => {
  const getRandomColor = () => {
    const colors = [
      '#f9b234',
      '#3ecd5e',
      '#4bb9f0',
      '#b070f0',
      '#cd3e94',
      '#ea9449',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className={styles['ag-format-container']} onClick={onClick}>
      <div className={styles['ag-courses_item']}>
        <div className={styles['ag-courses-item_link']}>
          <div
            className={styles['ag-courses-item_bg']}
            style={{ backgroundColor: getRandomColor() }}
          ></div>

          <div className={styles['ag-courses-item_title']}>{legionName}</div>
          <div className={styles['ag-courses-item_description']}>
            {legionDescription}
          </div>
          <div className={styles.roundInfo}>
            <>
              <Image
                src={'/img/group.svg'}
                width={25}
                height={25}
                alt="Group"
              />
              <div className={styles['ag-courses-item_description']}>
                {players.length} / {maxNumPlayers} Players
              </div>
            </>
            <>
              <Image
                src={'/img/swords.svg'}
                width={25}
                height={25}
                alt="Swords"
              />
              <div className={styles['ag-courses-item_description']}>
                {currentRound} / {numRounds} Rounds
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

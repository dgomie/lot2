import React, { useEffect, useState } from 'react';
import styles from './DashboardCard.module.css';

const DashboardCard = ({
  legionName,
  legionDescription,
  players,
  maxNumPlayers,
  numRounds,
  onClick,
}) => {
  const [background, setBackground] = useState('');
  const [shapeStyles, setShapeStyles] = useState({});
  

  useEffect(() => {
    const predefinedColors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A1',
      '#A133FF',
    ];

    const getRandomColor = () => {
      return predefinedColors[
        Math.floor(Math.random() * predefinedColors.length)
      ];
    };

    const getRandomPosition = () => {
      const top = Math.floor(Math.random() * 100) - 50; // Random value between -50 and 50
      const left = Math.floor(Math.random() * 100) - 50; // Random value between -50 and 50
      return { top: `${top}%`, left: `${left}%` };
    };

    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = getRandomColor();

    setBackground(`linear-gradient(135deg, ${color1}, ${color2}, ${color3})`);

    setShapeStyles({
      before: getRandomPosition(),
      after: getRandomPosition(),
    });
  }, []);

  return (
    <div onClick={onClick} className={styles.mainContainer} style={{ background }}>
      <div
        className={styles.shape}
        style={{
          ...shapeStyles.before,
          background: 'rgba(255, 255, 255, 0.2)',
        }}
      />
      <div
        className={styles.shape}
        style={{ ...shapeStyles.after, background: 'rgba(255, 255, 255, 0.1)' }}
      />
      <div className={styles.title}>{legionName}</div>
      <div className={styles.description}>{legionDescription}</div>
      <div className={styles.info}>
        {players.length} / {maxNumPlayers} Players
      </div>
      <div className={styles.info}>{numRounds} Rounds</div>
    </div>
  );
};

export default DashboardCard;

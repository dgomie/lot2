import React from 'react';
import styles from './LegionHeader.module.css'

const LegionHeader = ({legionData}) => {
  return (
    <div>
      <div className={styles.title}>{legionData.legionName}</div>
      <div className={styles.subtitle}>{legionData.legionDescription}</div>
    </div>
  );
};

export default LegionHeader
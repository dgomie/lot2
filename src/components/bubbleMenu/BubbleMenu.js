'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './BubbleMenu.module.css';

const BubbleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen((prev) => {
      return !prev;
    });
  };

  const handleOptionClick = (path, event) => {
    event.stopPropagation();
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className={styles.bubbleMenu}>
      <button
        className={`${styles.circleButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
      >
        +
      </button>
      <div className={`${styles.options} ${isOpen ? styles.show : ''}`}>
        <button
          className={styles.option}
          onClick={(event) => handleOptionClick('/legions', event)}
        >
          Join Legion
        </button>
        <button
          className={styles.option}
          onClick={(event) => handleOptionClick('/create-legion', event)}
        >
          Create Legion
        </button>
      </div>
    </div>
  );
};

export default BubbleMenu;

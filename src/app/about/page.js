'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './about.module.css';
import { Footer } from '@/components/footer/Footer';
import Button from '@/components/button/Button';

export default function AboutPage() {
  const router = useRouter();

  const handleDonateClick = () => {
    router.push('https://donate.stripe.com/3csfZl65kbeE2FG6oo');
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <h1>About Legion of Tones</h1>
        <p>
          <strong>Welcome to Legion of Tones</strong> — a social music game
          where creativity, good vibes, and friendly competition collide!
        </p>
        <p>
          In each round, players submit songs they believe best match a given
          prompt. Whether it&apos;s &quot;Best Song for a Final Battle&quot; or
          &quot;Chillest Tune for a Lazy Sunday,&quot; the goal is simple: pick
          the perfect track, listen to what others chose, and vote for your
          favorites. The submission with the most votes takes the crown for that
          round!
        </p>
        <p>
          Legion of Tones is a passion project created and developed by a small
          team. Fueled by a love for music, gaming, and a little bit of magic,
          this project is all about bringing people together through the power
          of songs.
        </p>
        <p>
          This is just the beginning — new features, game modes, and epic
          prompts are always in the works. Thank you for being part of this
          adventure!
        </p>
        <p>
          {' '}
          <strong>-The Legion of Tones Team</strong>
        </p>
        <div className={styles.donate}>
          <div className={styles.buttonContainer}>
            <Button variant="aquamarine" onClick={handleDonateClick}>
              Gift a Potion of Awakening
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import styles from './Welcome.module.css';
import Image from 'next/image';
import Button from '../button/Button';
import Link from 'next/link';

const Welcome = () => {
  const infoCardsRef = useRef([]);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        heroRef.current.classList.add(styles.shrink);
      } else {
        heroRef.current.classList.remove(styles.shrink);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            entry.target.classList.remove(styles.hidden);
          } else {
            entry.target.classList.remove(styles.visible);
            entry.target.classList.add(styles.hidden);
          }
        });
      },
      { threshold: 0.1 }
    );

    infoCardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      infoCardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero} ref={heroRef}>
        <Image
          src="/img/logo.svg"
          alt="Legion of Tones Logo"
          width={450}
          height={450}
        />
      </div>
      <div
        className={styles.infoCard}
        ref={(el) => (infoCardsRef.current[0] = el)}
      >
        <Image
          src="/img/gnomes.png"
          alt="Legion of Tones on Mobile"
          width={400}
          height={400}
        />
        <div className={styles.cardDescription}>
          <h2>Share, Play, Discover</h2>
          <p>
            Join in our social music game, where players form a legion and
            submit songs that best match a musical prompt. Once the submissions
            are in, players receive their playlist and vote for the song that
            ranks supreme. Find new music and share the songs you love with the
            Legion of Tones community!
          </p>
        </div>
      </div>
      <div
        className={styles.infoCard}
        ref={(el) => (infoCardsRef.current[1] = el)}
      >
        <div className={styles.cardDescription}>
          <h2>Bring the Legion with You</h2>
          <p>
            With iOS and Android optimization you can play on the go. Never miss
            a deadline with notifications when songs and votes are due.
          </p>
        </div>
        <Image
          src="/img/mockup2.png"
          alt="Legion of Tones on Mobile"
          width={400}
          height={400}
        />
      </div>

      <div
        className={styles.infoCard}
        ref={(el) => (infoCardsRef.current[2] = el)}
      >
        <div className={styles.cardDescription}>
          <h2 className={styles.centerTitle}>Join the Legion</h2>
          <p>Start your musical quest today!</p>
          <div className={styles.buttonContainer}>
            <Button variant="blue">
              <Link href={'auth/signup'}>Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

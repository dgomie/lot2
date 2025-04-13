import React, { useState, useEffect } from 'react';
import styles from './Welcome.module.css';
import Image from 'next/image';
import Button from '../button/Button';

const Welcome = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the default install prompt
      setDeferredPrompt(e); // Save the event for later use
      setIsInstallable(true); // Show the install button
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Show the install prompt
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null); // Clear the saved prompt
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero}>
        <Image
          src="/img/logo.svg"
          alt="Legion of Tones Logo"
          width={500}
          height={500}
        />
        {isInstallable && (
          <div className={styles.buttonContainer}>
            <Button onClick={handleInstallClick} variant="black">
              <Image
                src="/img/download.svg"
                width={30}
                height={30}
                alt="Download App"
              />
              Download App
            </Button>
          </div>
        )}
      </div>
      <div className={styles.infoCard}>
        <Image
          src="/img/gnomes.png"
          alt="Legion of Tones on Mobile"
          width={400}
          height={400}
        />
        <div className={styles.cardDescription}>
          <h2>Share, Play, Discover</h2>
          <p>
            A social music game, where players form a legion and submit songs
            that best match a musical prompt. Players receive a playlist of the
            submissions and vote for the song that ranks supreme. Find new music
            and share the songs you love with the Legion of Tones community!
          </p>
        </div>
      </div>
      <div className={styles.infoCard}>
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
    </div>
  );
};

export default Welcome;

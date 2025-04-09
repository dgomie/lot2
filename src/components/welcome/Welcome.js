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
      <Image
        src="/img/logo.svg"
        alt="Legion of Tones Logo"
        width={400}
        height={400}
      />
      {isInstallable && (
        <div className={styles.buttonContainer}>
          <Button onClick={handleInstallClick} variant='black'>
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
  );
};

export default Welcome;

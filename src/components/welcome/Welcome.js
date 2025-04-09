import React, { useState, useEffect } from 'react';
import styles from './Welcome.module.css';
import Image from 'next/image';

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
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
        <button className={styles.installButton} onClick={handleInstallClick}>
          Add to Home Screen
        </button>
      )}
    </div>
  );
};

export default Welcome;
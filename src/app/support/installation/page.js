import React from 'react';
import styles from './installation.module.css';
import { Footer } from '@/components/footer/Footer';
import Image from 'next/image';

export default function InstallationPage() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Legion of Tones PWA</h1>
          <p className={styles.description}>
            <strong>Legion of Tones</strong> is a Progressive Web App (PWA),
            meaning it combines the best of web and app experiences—no app store
            required! This lets you enjoy the game seamlessly across desktop and
            mobile devices. With a fast, immersive experience, you can easily
            submit songs, vote, and engage with fellow players without needing
            to open a browser every time.
          </p>

          <br />

          <h2>Why Install?</h2>
          <ul>
            <li>
              🎵 <strong>Quick & Convenient</strong> – Launch the game directly
              from your device.
            </li>
            <li>
              ⚔️ <strong>Full-Screen Mode</strong> – No browser distractions for
              a smoother experience.
            </li>
            <li>
              🎶 <strong>Push Notifications</strong>  – Get
              updates on new rounds and results.
            </li>
          </ul>
          <br />

          <h2>How to Install the Legion of Tones PWA</h2>

          <h3>On Android (Chrome)</h3>
          <ol>
            <li>
              Open <a href="#">Legion of Tones</a> in{' '}
              <strong>Google Chrome</strong>.
            </li>
            <li>
              Tap the <strong>three-dot menu</strong> (⋮) in the top-right
              corner.
            </li>
            <li>
              Select <strong>&quot;Add to Home screen&quot;</strong>.
            </li>
            <li>
              Tap <strong>&quot;Install&quot;</strong>, and the app will be added to your
              home screen.
            </li>
          </ol>

          <br />

          <h3>On iOS (Safari)</h3>
          <ol>
            <li>
              Open <a href="#">Legion of Tones</a> in <strong>Safari</strong>.
            </li>
            <li>
              Tap the <strong>Share button</strong> <Image src='/img/ios-share.svg' height={20} width={20} alt='iOS Share Button' /> at the bottom.
            </li>
            <li>
              Select <strong>&quot;Add to Home Screen&quot;</strong>.
            </li>
            <li>
              Tap <strong>&quot;Add&quot;</strong>, and the app will appear on your home
              screen.
            </li>
          </ol>

          <br />

          <h3>On Desktop (Chrome/Edge)</h3>
          <ol>
            <li>
              Open <a href="#">Legion of Tones</a> in{' '}
              <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
            </li>
            <li>
              Click the <strong>install icon</strong> (a download button) in the
              address bar.
            </li>
            <li>
              Select <strong>&quot;Install&quot;</strong> when prompted.
            </li>
            <li>
              The app will now appear in your Start menu or Applications folder.
            </li>
          </ol>

   
          <p>Now, you can jump into the musical showdown anytime! 🎶⚔️</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

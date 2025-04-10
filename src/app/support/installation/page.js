import React from 'react';
import styles from './installation.module.css';
import { Footer } from '@/components/footer/Footer';

export default function InstallationPage() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <h1>How to Install Page</h1>
      </div>
      <Footer />
    </div>
  );
}

import React from 'react';
import styles from './about.module.css';
import { Footer } from '@/components/footer/Footer';

export default function AboutPage() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <h1>About Page</h1>
      </div>
      <Footer />
    </div>
  );
}

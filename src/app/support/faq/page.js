import React from 'react';
import styles from './faq.module.css';
import { Footer } from '@/components/footer/Footer';

export default function FaqPage() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <h1>FAQ Page</h1>
      </div>
      <Footer />
    </div>
  );
}

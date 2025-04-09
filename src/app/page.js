'use client';
import Welcome from '@/components/welcome/Welcome';
import styles from './page.module.css';
import { Footer } from '@/components/footer/Footer';

export default function Home() {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.page}>
        <Welcome />
      </div>
      <Footer />
    </div>
  );
}

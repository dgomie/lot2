'use client';
import Welcome from '@/components/welcome/Welcome';
import styles from './page.module.css';


export default function Home() {

  return (
    <div className={styles.page}>
      <Welcome />
    </div>
  );
}

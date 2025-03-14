'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Signup from '../../../components/signup/Signup';
import { AuthContext } from '@/context/AuthContext';
import styles from './page.module.css'
import Link from 'next/link';

export default function SignupPage() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  return (
    <div className={styles.mainContainer}>
      <Signup />
      <div className={styles.text}>Already a member? <Link href="/auth/login" className={styles.link}>Sign in</Link></div>
    </div>
  );
}
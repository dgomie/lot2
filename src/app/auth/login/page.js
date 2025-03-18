'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../../../components/login/Login';
import { AuthContext } from '@/context/AuthContext';
import styles from './page.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  return (
    <>
      <Login />
      <div className={styles.text}>Don&apos;t have an account? <Link href='/auth/signup' className={styles.link}>Sign Up</Link></div>
      <div className={styles.text}><Link href='/auth/forgot-password' className={styles.link}>Forgot Password?</Link></div>
    </>
  );
}

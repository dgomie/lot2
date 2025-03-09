'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../../../components/login/Login';
import { AuthContext } from '../../../context/AuthContext';

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
      <div>Don&apos;t have an account? Sign Up</div>
    </>
  );
}
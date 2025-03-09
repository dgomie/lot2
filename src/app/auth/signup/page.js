'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Signup from '../../../components/signup/Signup';
import { AuthContext } from '../../../context/AuthContext';

export default function SignupPage() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  return (
    <div>
      <Signup />
      <div>Already a member? Sign in</div>
    </div>
  );
}
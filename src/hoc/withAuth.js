'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Loader from '@/components/loader/Loader';
import { sendEmailVerification, getAuth } from 'firebase/auth';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const { currentUser, loading } = useContext(AuthContext);
    const [verificationSent, setVerificationSent] = useState(false);

    useEffect(() => {
      console.log('Auth state in withAuth:', { loading, currentUser }); // Debug log

      if (!loading && !currentUser) {
        console.log('Redirecting to login...');
        router.push('/auth/login'); // Redirect to login if not authenticated
      }
    }, [loading, currentUser, router]);

    const handleResendVerification = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          await sendEmailVerification(user);
          setVerificationSent(true);
        } catch (error) {
          console.error('Error resending verification email:', error);
        }
      } else {
        console.error('No authenticated user found.');
      }
    };

    if (loading) {
      return <Loader />;
    }

    if (currentUser && !currentUser.emailVerified) {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Your email is not verified. Please check your inbox.</p>
          <button
            onClick={handleResendVerification}
            disabled={verificationSent}
          >
            {verificationSent
              ? 'Verification Email Sent'
              : 'Resend Verification Email'}
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} currentUser={currentUser} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export default withAuth;

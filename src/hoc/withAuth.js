'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Loader from '@/components/loader/Loader';
import { ValidateEmail } from '@/components/validateEmail/ValidateEmail';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const { currentUser, loading } = useContext(AuthContext);

    useEffect(() => {
      console.log('Auth state in withAuth:', { loading, currentUser }); // Debug log

      if (!loading && !currentUser) {
        console.log('Redirecting to login...');
        router.push('/auth/login'); // Redirect to login if not authenticated
      }
    }, [loading, currentUser, router]);


    if (loading) {
      return <Loader />;
    }

    if (currentUser && !currentUser.emailVerified) {
      return (
        <ValidateEmail />
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

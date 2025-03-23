'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Loader from '@/components/loader/Loader';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const router = useRouter();
    const { currentUser, loading } = useContext(AuthContext);

    useEffect(() => {
      if (!loading && !currentUser) {
        router.push('/auth/login');
      }
    }, [loading, currentUser, router]);

    if (loading || !currentUser) {
      return <Loader />;
    }

    // Pass currentUser to the WrappedComponent
    return <WrappedComponent {...props} currentUser={currentUser} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export default withAuth;

'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

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
      return <div>Loading...</div>; // You can replace this with a loading spinner or any other loading indicator
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuth;
};

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export default withAuth;
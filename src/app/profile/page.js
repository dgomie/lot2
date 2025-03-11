'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {currentUser ? (
        <>
          <p>Username: {currentUser.username}</p>
          <p>Email: {currentUser.email}</p>
          {/* Add more profile details here */}
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default withAuth(Profile);
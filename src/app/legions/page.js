'use client';

import React, { useContext } from 'react';
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


const Legions = () => {
  return <div>Legions Page</div>;
};

export default withAuth(Legions)
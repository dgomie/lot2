'use client'
import withAuth from '../../hoc/withAuth';
import { AuthContext } from '@/context/AuthContext';
import React, { useContext } from 'react';
import CreateLegionForm from '@/components/createLegionForm/CreateLegionForm';
import styles from './createlegion.module.css'

const CreateLegion = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formWrapper}>
        <CreateLegionForm currentUser={currentUser} />
      </div>
    </div>
  );
};

export default withAuth(CreateLegion);
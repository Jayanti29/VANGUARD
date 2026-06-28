import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingShield from './ui/LoadingShield';

export default function ProtectedRoute({ children }) {
  const { user, currentUser, loading } = useAuth();
  
  const authenticatedUser = currentUser || user;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingShield loadingText="Synchronizing secure community session..." />
      </div>
    );
  }

  if (!authenticatedUser) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}

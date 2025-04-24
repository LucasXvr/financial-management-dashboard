import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from './header';

const AuthLayout = () => {
  // Check if user is authenticated by looking for the token
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If there's no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout; 
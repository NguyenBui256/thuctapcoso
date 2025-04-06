import React from 'react';
import { Link } from 'react-router-dom';
import { getStyles } from '../utils/helpers';

const NotFound = () => {
  const styles = getStyles();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-7xl font-extrabold" style={styles.textPrimary}>404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={styles.bgPrimary}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 
import React from 'react';
import { getStyles } from '../utils/helpers';

const Loading = () => {
  const styles = getStyles();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-opacity-50" style={styles.borderPrimary}></div>
      <h2 className="mt-4 text-xl font-medium text-gray-700">Loading...</h2>
    </div>
  );
};

export default Loading; 
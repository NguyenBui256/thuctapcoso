import React from 'react';

const Presets = ({ projectId }) => {
  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Project Presets</h1>
      </div>
      
      <p className="text-gray-600 mb-6">
        Configure default values for this project. These settings will be used as defaults when creating new items.
      </p>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg font-medium">This feature will be implemented soon.</p>
          <p className="text-sm">Come back later to configure project presets.</p>
        </div>
      </div>
    </div>
  );
};

export default Presets; 
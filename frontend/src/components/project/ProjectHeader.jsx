import React from 'react';

const ProjectHeader = ({ currentProject, watching, liked }) => {
  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";
  const styles = {
    bgPrimary: { backgroundColor: primaryColor },
    textPrimary: { color: primaryColor },
  };

  return (
    <div className="pb-5 border-b border-gray-200 mb-6 flex justify-between">
      <div className="flex items-start">
        <div className="w-16 h-16 rounded-md flex items-center justify-center text-white mr-4" style={styles.bgPrimary}>
          {/* Project logo/icon */}
          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"></line>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"></line>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{currentProject?.name || 'Project Name'}</h1>
          <p className="mt-1 text-sm text-gray-500">{currentProject?.description || 'Project description goes here.'}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="flex items-center space-x-1 bg-cyan-50 text-cyan-700 px-3 py-1 rounded">
          <span className="text-lg">♥</span>
          <span className="text-sm">Liked</span>
          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-sm ml-1 text-sm">{liked}</span>
        </button>
        <button className="flex items-center space-x-1 bg-cyan-50 text-cyan-700 px-3 py-1 rounded group relative">
          <span className="text-lg">👁</span>
          <span className="text-sm">Watching</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-sm ml-1 text-sm">{watching}</span>
        </button>
        <button className="bg-cyan-50 text-cyan-700 p-2 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader; 
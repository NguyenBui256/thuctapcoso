import React from 'react';

const ProjectSelector = ({ projects, currentProject, handleProjectSelect, formatDate, getUserInitials }) => {
  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";
  const styles = {
    bgPrimary: { backgroundColor: primaryColor },
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Available Projects</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-3 sm:p-4">
        <ul className="divide-y divide-gray-100">
          {projects.map(project => (
            <li 
              key={project?.id} 
              className={`py-3 px-2 cursor-pointer rounded transition-all ${
                currentProject?.id === project?.id 
                  ? 'bg-gray-50 shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleProjectSelect(project)}
            >
              <div className="flex items-center">
                <div 
                  className={`h-10 w-10 rounded-md flex items-center justify-center text-white mr-3 shadow-sm transition-transform ${
                    currentProject?.id === project?.id ? 'transform scale-110' : ''
                  }`} 
                  style={styles.bgPrimary}
                >
                  <span className="text-xs font-medium">{getUserInitials(project?.name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{project?.name || 'Unnamed Project'}</h4>
                  <p className="text-xs text-gray-500 truncate mt-1">{project?.description || 'No description'}</p>
                  
                  {/* Project metadata */}
                  <div className="flex items-center mt-2 space-x-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      {project?.memberCount || '0'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(project?.createdAt)?.split(',')[0] || 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <span 
                        className="inline-block px-2 py-0.5 text-xs rounded-full" 
                        style={{
                          backgroundColor: 'rgba(153, 214, 220, 0.2)', 
                          color: 'rgb(70, 130, 140)'
                        }}
                      >
                        {project?.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow indicator for selected project */}
                {currentProject?.id === project?.id && (
                  <div className="flex-shrink-0 ml-2">
                    <svg className="w-5 h-5" style={{color: primaryColor}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectSelector; 
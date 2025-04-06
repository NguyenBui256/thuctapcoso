import React from 'react';

const ProjectInfo = ({ currentProject, projectMembers, formatDate }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="px-2 py-1 text-xs font-medium rounded-full" 
                    style={{backgroundColor: 'rgba(153, 214, 220, 0.2)', color: 'rgb(70, 130, 140)'}}>
                {currentProject?.status || 'Active'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(currentProject?.createdAt) || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Team Size</dt>
            <dd className="mt-1 text-sm text-gray-900">{projectMembers?.length || 0} members</dd>
          </div>
          {currentProject && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Visibility</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {currentProject.isPublic ? 'Public' : 'Private'}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ProjectInfo; 
import React from 'react';

const ProjectActivities = ({ activities, loading, formatDate, getUserInitials }) => {
  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Project Activities</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Activity items */}
        <div className="space-y-6">
          {loading && <div className="text-center py-4">Loading activities...</div>}
          
          {!loading && activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <div className="flex flex-col md:flex-row md:items-start relative border-l-4 pl-4 pb-4" 
                  style={{borderColor: primaryColor}} 
                  key={activity?.id || index}>
                {/* Time indicator */}
                <div className="absolute right-0 top-0 text-xs text-gray-500">
                  {formatDate(activity?.timestamp) || 'Unknown date'}
                </div>
                
                {/* Avatar */}
                <div className="mr-4 flex-shrink-0 mb-2 md:mb-0">
                  <a href={`/users/${activity?.userId}`} className="block group relative">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                        style={{backgroundColor: primaryColor}}>
                      <span className="text-sm font-medium">{getUserInitials(activity?.username)}</span>
                    </div>
                    {/* Username tooltip */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 -translate-y-full 
                                  hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 
                                  whitespace-nowrap z-10">
                      View profile
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                    border-solid border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </a>
                </div>
                
                {/* Activity content */}
                <div className="flex-1 min-w-0 pr-8 text-left">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    <a href={`/users/${activity?.userId}`} 
                      className="text-taiga-secondary hover:underline">
                      {activity?.username || 'Unknown User'}
                    </a>{' - '}
                    <span>{activity?.action || 'performed an action'}</span>{' '}
                    {activity?.targetType && (
                      <a href={`/${activity?.targetType.toLowerCase()}s/${activity?.targetId}`}
                        className="text-taiga-secondary hover:underline">
                        {activity?.targetName || `#${activity?.targetId}`}
                      </a>
                    )}
                  </h4>
                  
                  <div className="mt-1">
                    <p className="text-sm text-gray-600 text-left">
                      {activity?.details || 'No description available'}
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-2 flex space-x-2">
                    <a href={`/activities/${activity?.id}`} 
                      className="text-xs text-taiga-secondary hover:underline">
                      View details
                    </a>
                    {activity?.targetType && (
                      <a href={`/${activity?.targetType.toLowerCase()}s/${activity?.targetId}`} 
                        className="text-xs text-taiga-secondary hover:underline">
                        Go to {activity?.targetType.toLowerCase()}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-gray-500">No activities found for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectActivities;
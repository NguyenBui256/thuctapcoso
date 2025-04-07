import React from 'react';

const TeamMembers = ({ projectMembers, loading, getUserInitials }) => {
  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Team</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {loading && <div>Loading team members...</div>}
          
          {!loading && projectMembers && projectMembers.length > 0 ? (
            projectMembers.map((member, index) => (
              <a 
                href={`/users/${member?.userId}`}
                className="relative group" 
                key={member?.id || index}
                title={member?.username || 'Unknown User'}
              >
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform transform hover:scale-110"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-sm font-medium">{getUserInitials(member?.username)}</span>
                </div>
                {member?.isAdmin && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-yellow-400 rounded-full text-xs shadow-sm">★</span>
                )}
                
                {/* Enhanced tooltip with more information - positioned ABOVE avatar */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 -translate-y-full 
                              hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 
                              whitespace-nowrap z-10 min-w-[100px] shadow-lg">
                  <div className="font-medium mb-1">{member?.username || 'Unknown User'}</div>
                  <div className="text-xs text-gray-300">
                    {member?.role || 'Team Member'}
                  </div>
                  <div className="text-xs mt-1 text-taiga-primary">{member?.points || 0} points</div>
                  {/* Arrow pointing down */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                border-solid border-4 border-transparent border-t-gray-800"></div>
                </div>
              </a>
            ))
          ) : (
            !loading && (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers; 
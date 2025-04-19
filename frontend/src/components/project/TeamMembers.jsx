import React from 'react';

const TeamMembers = ({ projectMembers, loading, getUserInitials }) => {
  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";

  // Debug log to check members data
  console.log("TeamMembers - Current members:", projectMembers);

  const handleImageError = (e, member) => {
    console.log("Avatar load failed for member:", member.username);
    e.target.style.display = 'none';
    e.target.parentElement.style.backgroundColor = primaryColor;
    e.target.parentElement.innerHTML = `<span class="text-sm font-medium">${getUserInitials(member.username)}</span>`;
  };

  return (
    <div className="bg-white overflow-visible shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Team</h3>
      </div>
      <div className="px-4 py-5 sm:p-6 overflow-visible">
        <div className="flex flex-wrap gap-3 overflow-visible">
          {loading && <div>Loading team members...</div>}
          
          {!loading && projectMembers && projectMembers.length > 0 ? (
            projectMembers.map((member, index) => {
              // Debug log for each member's avatar
              console.log(`Member ${member.username} avatar:`, member.avatar);
              
              return (
                <a 
                  href={`/users/${member?.userId}`}
                  className="relative group overflow-visible" 
                  key={member?.id || index}
                  title={member?.username || 'Unknown User'}
                >
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform transform hover:scale-110 overflow-hidden"
                    style={{ backgroundColor: member?.avatar ? 'transparent' : primaryColor }}
                  >
                    {member?.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.username}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, member)}
                      />
                    ) : (
                      <span className="text-sm font-medium">{getUserInitials(member.username || member.userFullName)}</span>
                    )}
                  </div>
                  {member?.isAdmin && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-yellow-400 rounded-full text-xs shadow-sm">★</span>
                  )}
                  
                  {/* Enhanced tooltip with more information - positioned ABOVE avatar */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-20
                                hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 
                                whitespace-nowrap z-[9999] min-w-[100px] shadow-lg" 
                       style={{ pointerEvents: 'none' }}>
                    <div className="font-medium mb-1">{member?.userFullName || member?.username || 'Unknown User'}</div>
                    <div className="text-xs text-gray-300">
                      {member?.roleName || 'Team Member'}
                    </div>
                    <div className="text-xs mt-1 text-taiga-primary">{member?.totalPoint || 0} points</div>
                    {/* Arrow pointing down */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                  border-solid border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </a>
              );
            })
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
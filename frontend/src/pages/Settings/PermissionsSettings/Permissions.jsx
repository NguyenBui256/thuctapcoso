import React, { useState, useEffect } from 'react';

const Permissions = ({ projectId, roleId }) => {
  const [role, setRole] = useState({
    id: 'front',
    name: 'Front',
    permissions: {
      epics: {
        view: true,
        add: true,
        modify: true,
        comment: true,
        delete: true
      },
      sprints: {
        view: true,
        add: true,
        modify: true,
        delete: true
      },
      userStories: {
        view: true,
        add: true,
        modify: true,
        comment: true,
        delete: true
      }
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, fetch role permissions here
    setLoading(true);
    setTimeout(() => {
      // Mock data for different roles
      if (roleId === 'front') {
        setRole({
          id: 'front',
          name: 'Front',
          permissions: {
            epics: {
              view: true,
              add: true,
              modify: true,
              comment: true,
              delete: true
            },
            sprints: {
              view: true,
              add: true,
              modify: true,
              delete: true
            },
            userStories: {
              view: true,
              add: true,
              modify: true,
              comment: true,
              delete: true
            }
          }
        });
      } else if (roleId === 'back') {
        setRole({
          id: 'back',
          name: 'Back',
          permissions: {
            epics: {
              view: true,
              add: false,
              modify: false,
              comment: true,
              delete: false
            },
            sprints: {
              view: true,
              add: true,
              modify: true,
              delete: false
            },
            userStories: {
              view: true,
              add: true,
              modify: true,
              comment: true,
              delete: false
            }
          }
        });
      } else {
        // Default role if not found
        setRole({
          id: roleId,
          name: roleId.charAt(0).toUpperCase() + roleId.slice(1).replace('_', ' '),
          permissions: {
            epics: {
              view: true,
              add: false,
              modify: false,
              comment: false,
              delete: false
            },
            sprints: {
              view: true,
              add: false,
              modify: false,
              delete: false
            },
            userStories: {
              view: true,
              add: false,
              modify: false,
              comment: false,
              delete: false
            }
          }
        });
      }
      setLoading(false);
    }, 500);
  }, [roleId]);

  const handleTogglePermission = (category, permission) => {
    setRole(prevRole => ({
      ...prevRole,
      permissions: {
        ...prevRole.permissions,
        [category]: {
          ...prevRole.permissions[category],
          [permission]: !prevRole.permissions[category][permission]
        }
      }
    }));
  };

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Permissions: {role.name}</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-600">
            This role is part of the roles involved in estimating user story points.
          </p>
          <div className="mt-2 flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={true} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Epics Section */}
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700">Epics</h2>
            <div className="flex flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">View epics</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.epics.view}
                    onChange={() => handleTogglePermission('epics', 'view')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Add epics</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.epics.add}
                    onChange={() => handleTogglePermission('epics', 'add')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Modify epics</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.epics.modify}
                    onChange={() => handleTogglePermission('epics', 'modify')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Comment epics</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.epics.comment}
                    onChange={() => handleTogglePermission('epics', 'comment')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Delete epics</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.epics.delete}
                    onChange={() => handleTogglePermission('epics', 'delete')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints Section */}
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700">Sprints</h2>
            <div className="flex flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">View sprints</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.sprints.view}
                    onChange={() => handleTogglePermission('sprints', 'view')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Add sprints</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.sprints.add}
                    onChange={() => handleTogglePermission('sprints', 'add')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Modify sprints</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.sprints.modify}
                    onChange={() => handleTogglePermission('sprints', 'modify')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Delete sprints</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.sprints.delete}
                    onChange={() => handleTogglePermission('sprints', 'delete')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* User Stories Section */}
        <div>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
            <h2 className="text-lg font-medium text-gray-700">User Stories</h2>
            <div className="flex flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">View user stories</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.userStories.view}
                    onChange={() => handleTogglePermission('userStories', 'view')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Add user stories</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.userStories.add}
                    onChange={() => handleTogglePermission('userStories', 'add')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Modify user stories</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.userStories.modify}
                    onChange={() => handleTogglePermission('userStories', 'modify')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-gray-700">Comment user stories</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.userStories.comment}
                    onChange={() => handleTogglePermission('userStories', 'comment')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Delete user stories</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={role.permissions.userStories.delete}
                    onChange={() => handleTogglePermission('userStories', 'delete')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions; 
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectActivities from '../components/project/ProjectActivities';
import ProjectInfo from '../components/project/ProjectInfo';
import ProjectSelector from '../components/project/ProjectSelector';
import TeamMembers from '../components/project/TeamMembers';
import { fetchProjects, fetchProjectActivities, fetchProjectMembers } from '../utils/api';
import { formatDate, getUserInitials } from '../utils/helpers';

function Dashboard() {
  const [watching, setWatching] = useState(3);
  const [liked, setLiked] = useState(1);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch projects
  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjects();
        console.log("Setting projects:", projectData);
        setProjects(projectData);
        
        // Set first project as current if none selected and if projects exist
        if (projectData.length > 0) {
          console.log("Setting current project:", projectData[0]);
          setCurrentProject(projectData[0]);
        } else {
          console.log("No projects found in response data");
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getProjects();
  }, []);
  
  // Fetch project activities and members when current project changes
  useEffect(() => {
    if (!currentProject) {
      console.log("No current project, skipping activity fetch");
      return;
    }
    
    console.log("Fetching activities for project:", currentProject.id);
    
    const getProjectData = async () => {
      setLoading(true);
      try {
        // Clear previous data when switching projects
        setActivities([]);
        setProjectMembers([]);
        
        // Fetch activities and members in parallel
        const [activitiesData, membersData] = await Promise.all([
          fetchProjectActivities(currentProject.id),
          fetchProjectMembers(currentProject.id)
        ]);
        
        console.log("Setting activities:", activitiesData);
        setActivities(activitiesData);
        
        console.log("Setting project members:", membersData);
        setProjectMembers(membersData);
      } catch (err) {
        console.error('Error fetching project data:', err);
        // Don't set error state to avoid blocking UI
      } finally {
        setLoading(false);
      }
    };
    
    getProjectData();
  }, [currentProject]);
  
  // Handle project selection
  const handleProjectSelect = (project) => {
    console.log("Selecting project:", project);
    setCurrentProject(project);
  };

  // Create sample activities in the proper format for testing
  const sampleActivities = [
    {
      id: 1,
      username: 'Nguyễn Trí Dũng',
      userId: 1,
      action: 'has added the user story',
      targetType: 'Story',
      targetId: 1,
      targetName: '#1 Cài đặt DB',
      timestamp: '2023-07-15T14:30:00',
      details: 'to abc'
    },
    {
      id: 2,
      username: 'Nguyễn Trí Dũng',
      userId: 1,
      action: 'has moved the user story',
      targetType: 'Story',
      targetId: 6,
      targetName: '#6 nnn',
      timestamp: '2023-07-15T13:45:00'
    },
    {
      id: 3,
      username: 'Nguyễn Trí Dũng',
      userId: 1,
      action: 'has updated the attribute "Assigned to" of the task',
      targetType: 'Task',
      targetId: 2,
      targetName: '#2 abc',
      timestamp: '2023-07-12T10:20:00',
      details: 'which belongs to the user story #1 Cài đặt DB to Nguyễn Trí Dũng'
    },
    {
      id: 4,
      username: 'Nguyễn Trí Dũng',
      userId: 1,
      action: 'has created a new user story',
      targetType: 'Story',
      targetId: 9,
      targetName: '#9 mmmm',
      timestamp: '2023-07-12T09:15:00',
      details: 'in 123'
    },
    {
      id: 5,
      username: 'Nguyễn Trí Dũng',
      userId: 1,
      action: 'has updated the attribute "Assigned users" of the user story',
      targetType: 'Story',
      targetId: 6,
      targetName: '#6 nnn',
      timestamp: '2023-07-12T08:30:00',
      details: 'to unassigned'
    }
  ];

  // Tạo dữ liệu mẫu cho team members nếu chưa có dữ liệu từ API
  const sampleTeamMembers = [
    {
      id: 1,
      userId: 1,
      username: 'Nguyễn Trí Dũng',
      role: 'Developer',
      points: 120,
      isAdmin: false
    },
    {
      id: 2,
      userId: 2,
      username: 'Bùi Thế Vĩnh Nguyên',
      role: 'Team Lead',
      points: 180,
      isAdmin: true
    },
    {
      id: 3,
      userId: 3,
      username: 'Trần Tuấn',
      role: 'Designer',
      points: 95,
      isAdmin: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-taiga-light font-sans w-screen max-w-none overflow-y-auto fixed inset-0">
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar currentProject={currentProject} />

        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto w-full overflow-x-hidden">
          {loading && <div className="text-center py-4">Loading activities...</div>}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="w-full">
            {/* Action buttons and project info at top on the same line */}
            <div className="flex justify-between items-center mb-6 bg-white rounded-sm shadow-sm p-4">
              {/* Project information - left side */}
              {currentProject && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-sm mr-3">
                    {currentProject.logo ? (
                      <img src={currentProject.logo} alt="Project Logo" className="w-8 h-8" />
                    ) : (
                      <div className="text-lg text-gray-500">{currentProject.name?.substring(0, 2) || '123'}</div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">{currentProject.name || '123'}</h2>
                    <p className="text-xs text-gray-600">{currentProject.description || 'asd'}</p>
                  </div>
                </div>
              )}

              {/* Action buttons - right side */}
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

            {/* Main content grid */}
            <div className="flex flex-col md:flex-row space-x-0 md:space-x-6">
              {/* Activity feed - left side */}
              <div className="w-full md:w-2/3 mb-6 md:mb-0">
                <div className="bg-white rounded-sm shadow-sm">
                  {sampleActivities.map((activity, index) => (
                    <div 
                      key={activity.id || index} 
                      className="p-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex">
                        {/* User avatar */}
                        <div className="mr-4 flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-xs">
                            NT
                          </div>
                        </div>
                        
                        {/* Activity details */}
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium text-purple-600">{activity.username}</span>
                            <span className="text-gray-700"> {activity.action} </span>
                            <a href={`/${activity.targetType.toLowerCase()}s/${activity.targetId}`} className="font-medium text-blue-500 hover:underline">
                              {activity.targetName}
                            </a>
                            {activity.details && <span className="text-gray-700"> {activity.details}</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right sidebar */}
              <div className="w-full md:w-1/3">
                {/* Project info card */}
                <div className="bg-white rounded-sm shadow-sm mb-6">
                  <div className="p-4">
                    <h3 className="text-base font-medium mb-2 text-center">This project is looking for people</h3>
                    <p className="text-sm text-gray-700 mb-4 text-center">Tôi cần người giỏi</p>
                    <button className="flex items-center justify-center w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">
                      <span className="mr-2">✉</span>
                      Contact the project
                    </button>
                  </div>
                </div>
                
                {/* Team members component */}
                <TeamMembers 
                  projectMembers={projectMembers.length > 0 ? projectMembers : sampleTeamMembers}
                  loading={loading}
                  getUserInitials={getUserInitials}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import ProjectHeader from '../../components/project/ProjectHeader';
import ProjectActivities from '../../components/project/ProjectActivities';
import ProjectInfo from '../../components/project/ProjectInfo';
import ProjectSelector from '../../components/project/ProjectSelector';
import TeamMembers from '../../components/project/TeamMembers';
import { fetchProjectsByUserId, fetchProjectActivities, fetchProjectMembers, fetchProjectById } from '../../utils/api';
import { formatDate, getUserInitials } from '../../utils/helpers';
import { Link, useNavigate, useParams } from 'react-router-dom';

function ProjectDetail() {
  const [watching, setWatching] = useState(3);
  const [liked, setLiked] = useState(1);
  const [currentProject, setCurrentProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { projectId } = useParams();

  // Handle sidebar collapse state
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Fetch project by ID from URL params
  useEffect(() => {
    const getProject = async () => {
      if (!projectId) {
        setError('Project ID not found');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjectById(projectId);
        setCurrentProject(projectData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    getProject();
  }, [projectId]);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Main content area with sidebar */}
      <div className="flex flex-1 h-[calc(100vh-3rem)]">
        {/* Sidebar fixed on the left */}
        <Sidebar 
          currentProject={currentProject} 
          onToggleCollapse={handleSidebarToggle}
        />
        
        {/* Main content with right margin to account for sidebar */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} overflow-auto transition-all duration-300`}>
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Main content */}
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 pr-0 md:pr-8">
                {/* Project Details */}
                {loading && <div className="text-center py-4">Loading activities...</div>}

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                  </div>
                )}

                {/* Project information card */}
                {currentProject && (
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-sm mr-4">
                        {currentProject.logo ? (
                          <img src={currentProject.logo} alt="Project Logo" className="w-10 h-10" />
                        ) : (
                          <div className="text-lg text-gray-500">{currentProject.name?.substring(0, 2) || 'P'}</div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-medium">{currentProject.name}</h2>
                        <p className="text-sm text-gray-600">{currentProject.description || 'No description available'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity feed */}
                <div className="bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium p-4 border-b">Recent Activities</h3>
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
              <div className="w-full md:w-1/3 mt-6 md:mt-0">
                {/* Project info card */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
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
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail; 
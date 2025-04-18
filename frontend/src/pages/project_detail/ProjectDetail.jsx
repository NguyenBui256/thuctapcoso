import { useState, useEffect } from 'react';
import ProjectHeader from '../../components/project/ProjectHeader';
import ProjectActivities from '../../components/project/ProjectActivities';
import ProjectInfo from '../../components/project/ProjectInfo';
import ProjectSelector from '../../components/project/ProjectSelector';
import TeamMembers from '../../components/project/TeamMembers';
import { fetchProjectsByUserId, fetchProjectActivities, fetchProjectMembers, fetchProjectById } from '../../utils/api';
import { formatDate, getUserInitials } from '../../utils/helpers';
import { Link, useNavigate, useParams } from 'react-router-dom';

function ProjectDetail() {
  const [currentProject, setCurrentProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    const getProject = async () => {
      if (!projectId) {
        console.error("No project ID provided");
        setError('Project ID not found');
        return;
      }

      console.log("Fetching project with ID:", projectId);
      setLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjectById(projectId);
        console.log("Received project data:", projectData);
        if (!projectData || !projectData.id) {
          throw new Error("Invalid project data received");
        }
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

  useEffect(() => {
    if (!currentProject) {
      console.log("No current project, skipping data fetch");
      return;
    }

    console.log("Current project data:", currentProject);
    console.log("Fetching activities and members for project:", currentProject.id);

    const getProjectData = async () => {
      setLoading(true);
      try {
        setActivities([]);
        setProjectMembers([]);

        console.log("Starting parallel fetch for activities and members");
        const [membersData] = await Promise.all([
          fetchProjectMembers(currentProject.id)
        ]);

        console.log("Members data received:", membersData);

        console.log("MEM:")
        console.log(membersData);
        setProjectMembers(membersData || []);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setActivities([]);
        setProjectMembers([]);
      } finally {
        setLoading(false);
      }
    };

    getProjectData();
  }, [currentProject]);

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
    <>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 pr-0 md:pr-8">
          {loading && <div className="text-center py-4">Loading project details...</div>}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

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

          <div className="bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium p-4 border-b">Recent Activities</h3>
            {sampleActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex">
                  <div className="mr-4 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-xs">
                      {getUserInitials(activity.username)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-purple-600">{activity.username}</span>
                      <span className="text-gray-700"> {activity.action} </span>
                      <a href={`#`} className="font-medium text-blue-500 hover:underline">
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
            {sampleActivities.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">No recent activities found.</div>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/3 mt-6 md:mt-0">
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

          <TeamMembers
            projectMembers={sampleTeamMembers}
            loading={loading}
            getUserInitials={getUserInitials}
          />
        </div>
      </div>
    </>
  );
}

export default ProjectDetail; 
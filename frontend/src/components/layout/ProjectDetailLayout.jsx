import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Assuming Sidebar is in the same layout folder
import { fetchProjectById } from '../../utils/api'; // To fetch project for sidebar name
import ErrorPage, { ERROR_TYPE } from '../../pages/ErrorPage'; // Import ErrorPage and ERROR_TYPE
import { FiArrowUp } from 'react-icons/fi'; // Import icon
import { ToastContainer, toast } from 'react-toastify';

const ProjectDetailLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [errorProject, setErrorProject] = useState(null);
  const { projectId } = useParams(); // Get projectId from the route
  const [showScrollTop, setShowScrollTop] = useState(false); // State for button
  const [moduleSettingsVersion, setModuleSettingsVersion] = useState(0); // Add this line
  const navigate = useNavigate();

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const refreshModuleSettings = () => {
    setModuleSettingsVersion(prev => prev + 1);
  };

  // Fetch project details if projectId is available, for the Sidebar
  useEffect(() => {
    const getProject = async () => {
      if (!projectId) {
        setCurrentProject(null); // Clear project if no ID
        return;
      }
      setLoadingProject(true);
      setErrorProject(null);
      try {
        const projectData = await fetchProjectById(projectId);
        if (!projectData || !projectData.id) {
          throw new Error("Invalid project data received for layout");
        }
        setCurrentProject(projectData);
      } catch (err) {
        setErrorProject(err.message);
        console.error('Error fetching project for layout:', err);

        // If access is denied, show toast and redirect
        if (err.message.includes('access')) {
          toast.error('You do not have access to this project');
          setTimeout(() => {
            navigate('/projects');
          }, 1500);
        }

        setCurrentProject(null); // Clear project on error
      } finally {
        setLoadingProject(false);
      }
    };

    getProject();
    // Reset scroll state when project ID changes
    setShowScrollTop(false);
    // Scroll window to top when project changes
    window.scrollTo(0, 0);

  }, [projectId, navigate]); // Re-fetch if projectId changes

  // Effect for scroll listener on window
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300;
      // console.log('Window Scroll Y:', window.scrollY, 'Should Show:', shouldShow); // Keep for debugging if needed
      setShowScrollTop(shouldShow);
    };

    console.log('Adding scroll listener to window'); // Debug log
    window.addEventListener('scroll', handleScroll);

    return () => {
      console.log('Removing scroll listener from window'); // Debug log
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll window to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentProject={currentProject}
          onToggleCollapse={handleSidebarToggle}
          moduleSettingsVersion={moduleSettingsVersion}
        />

        <main className={`relative flex-1 overflow-y-auto ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
          <div className="">
            {loadingProject && <div>Loading project context...</div>}
            {errorProject && <ErrorPage errorType={ERROR_TYPE.UNKNOWN_ERROR} errorMessage={errorProject} />}
            {!loadingProject && !errorProject && currentProject && (
              <Outlet context={{ refreshModuleSettings }} />
            )}
          </div>

          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 p-3 bg-taiga-primary text-white rounded-full shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-taiga-primary focus:ring-opacity-75 transition duration-300"
              aria-label="Scroll to top"
            >
              <FiArrowUp size={20} />
            </button>
          )}
        </main>
      </div>

      <ToastContainer
        position='bottom-right'
      />
    </div>
  );
};

export default ProjectDetailLayout; 
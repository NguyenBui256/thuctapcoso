import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchWithAuth, getCurrentUserId } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

const Sidebar = ({ currentProject, onToggleCollapse, moduleSettingsVersion }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [moduleSettings, setModuleSettings] = useState({
    epics: true,
    scrum: true,
    kanban: true,
    issues: true,
    wiki: true
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";
  const styles = {
    bgPrimary: { backgroundColor: primaryColor },
    textPrimary: { color: primaryColor },
  };

  // Determine active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/settings')) {
      setActiveTab('settings');
    } else if (/\/projects\/[0-9]+$/.test(path)) {
      setActiveTab('project');
    } else if (path.includes('/epics')) {
      setActiveTab('epics');
    } else if (path.includes('/backlog')) {
      setActiveTab('scrum');
    } else if (path.includes('/kanban')) {
      setActiveTab('kanban');
    } else if (path.includes('/issues')) {
      setActiveTab('issues');
    } else if (path.includes('/wiki')) {
      setActiveTab('wiki');
    } else if (path.includes('/team')) {
      setActiveTab('team');
    } else if (path.includes('/search')) {
      setActiveTab('search');
    }
  }, [location.pathname]);

  // Determine active tab based on URL
  const isSettingsActive = location.pathname.includes('/settings');
  const isProjectActive = !isSettingsActive && /\/projects\/[0-9]+$/.test(location.pathname);
  const isScrumActive = location.pathname.includes('/backlog');
  const isKanbanActive = location.pathname.includes('/kanban');
  const isIssuesActive = location.pathname.includes('/issues');
  const isWikiActive = location.pathname.includes('/wiki');
  const isTeamActive = location.pathname.includes('/team');

  // Fetch module settings
  useEffect(() => {
    const fetchModuleSettings = async () => {
      if (!currentProject?.id) return;

      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${currentProject.id}/modules`,
          `/projects/${currentProject.id}/settings`,
          true
        );

        if (response && response.ok) {
          const responseData = await response.json();
          const settings = {};

          if (responseData.data && Array.isArray(responseData.data)) {
            responseData.data.forEach(module => {
              if (module.module && module.module.name) {
                const moduleName = module.module.name.toLowerCase();
                settings[moduleName] = module.isOn;
              }
            });

            setModuleSettings(settings);
          }
        }
      } catch (err) {
        console.error('Error fetching module settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleSettings();
  }, [currentProject?.id, moduleSettingsVersion]);

  // Notify parent component when sidebar collapses/expands
  useEffect(() => {
    if (onToggleCollapse && typeof onToggleCollapse === 'function') {
      onToggleCollapse(sidebarCollapsed);
    }
  }, [sidebarCollapsed, onToggleCollapse]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-taiga-dark text-white flex-shrink-0 fixed left-0 top-12 h-[calc(100vh-3rem)] transition-all duration-300`}>
      <div className="p-4 h-full flex flex-col">
        <div className="mb-6">
          <Link
            to={currentProject?.id && `/projects/${currentProject.id}`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'project' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('project')}
            style={activeTab === 'project' ? styles.bgPrimary : {}}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate">{currentProject?.name || 'Projects'}</span>}
          </Link>
        </div>

        <div className="mb-6">
          <nav className="space-y-1">
            {moduleSettings.scrum && (
              <Link
                to={currentProject?.id && `/projects/${currentProject.id}/backlog`}
                className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${isScrumActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setActiveTab('scrum')}
                style={isScrumActive ? styles.bgPrimary : {}}
              >
                <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 truncate">Scrum</span>}
              </Link>
            )}

            {moduleSettings.kanban && (
              <Link
                to={currentProject?.id && `/projects/${currentProject.id}/kanban`}
                className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${isKanbanActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setActiveTab('kanban')}
                style={isKanbanActive ? styles.bgPrimary : {}}
              >
                <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M9 3v18M3 9h18"></path>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 truncate">Kanban</span>}
              </Link>
            )}

            {moduleSettings.issues && (
              <Link
                to={currentProject?.id && `/projects/${currentProject.id}/issues`}
                className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${isIssuesActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setActiveTab('issues')}
                style={isIssuesActive ? styles.bgPrimary : {}}
              >
                <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 truncate">Issues</span>}
              </Link>
            )}
          </nav>
        </div>

        <div className="mt-auto space-y-1">
          <Link
            to={currentProject?.id && `/projects/${currentProject.id}/search`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'search' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('search')}
            style={activeTab === 'search' ? styles.bgPrimary : {}}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate">Search</span>}
          </Link>

          {moduleSettings.wiki && (
            <Link
              to={currentProject?.id && `/projects/${currentProject.id}/wiki`}
              className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${isWikiActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('wiki')}
              style={isWikiActive ? styles.bgPrimary : {}}
            >
              <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-2 truncate">Wiki</span>}
            </Link>
          )}

          <Link
            to={currentProject?.id && `/projects/${currentProject.id}/team`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${isTeamActive ? 'bg-primary text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('team')}
            style={isTeamActive ? styles.bgPrimary : {}}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate">Team</span>}
          </Link>
          <Link
            to={currentProject?.id && `/projects/${currentProject.id}/settings`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'settings' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('settings')}
            style={activeTab === 'settings' ? styles.bgPrimary : {}}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate">Settings</span>}
          </Link>
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md mt-4`}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={sidebarCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate whitespace-nowrap">Collapse menu</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
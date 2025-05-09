import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ currentProject, onToggleCollapse }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('project');
  const location = useLocation();

  // Custom styles for the new primary color
  const primaryColor = "rgb(153, 214, 220)";
  const styles = {
    bgPrimary: { backgroundColor: primaryColor },
    textPrimary: { color: primaryColor },
  };

  // Set active tab based on URL path
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/backlog') || path.includes('/sprint')) {
      setActiveTab('scrum');
    } else if (path.includes('/epics')) {
      setActiveTab('epics');
    } else if (path.includes('/kanban')) {
      setActiveTab('kanban');
    } else if (path.includes('/issues') || path.includes('/issue/')) {
      setActiveTab('issues');
    } else if (path.includes('/wiki')) {
      setActiveTab('wiki');
    } else if (path.includes('/team')) {
      setActiveTab('team');
    } else if (path.includes('/search')) {
      setActiveTab('search');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else if (path.match(/\/projects\/\d+$/)) {
      setActiveTab('project');
    }
  }, [location.pathname]);

  // Notify parent component when sidebar collapses/expands
  useEffect(() => {
    if (onToggleCollapse && typeof onToggleCollapse === 'function') {
      onToggleCollapse(sidebarCollapsed);
    }
  }, [sidebarCollapsed, onToggleCollapse]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
            <Link
              to={currentProject?.id && `/projects/${currentProject.id}/epics`}
              className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'epics' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('epics')}
              style={activeTab === 'epics' ? styles.bgPrimary : {}}
            >
              <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              {!sidebarCollapsed && <span className="ml-2 truncate">Epics</span>}
            </Link>
            <Link
              to={currentProject?.id && `/projects/${currentProject.id}/backlog`}
              className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'scrum' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('scrum')}
              style={activeTab === 'scrum' ? styles.bgPrimary : {}}
            >
              <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-2 truncate">Scrum</span>}
            </Link>
            <Link
              to={currentProject?.id && `/projects/${currentProject.id}/kanban`}
            <div>
              <div
                to="/scrum"
                className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'scrum' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setActiveTab('scrum')}
                style={activeTab === 'scrum' ? styles.bgPrimary : {}}
              >
                <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                {!sidebarCollapsed && <span className="ml-2 truncate">Scrum</span>}
              </div>

              <Link
                to={'backlog'}
                className='ml-10 bg-cyan-500'
              >
                Backlog
              </Link>
            </div>
            <Link
              to="/kanban"
              className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'kanban' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('kanban')}
              style={activeTab === 'kanban' ? styles.bgPrimary : {}}
            >
              <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <path d="M9 3v18M3 9h18"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-2 truncate">Kanban</span>}
            </Link>
            <Link
              to={currentProject?.id && `/projects/${currentProject.id}/issues`}
              className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'issues' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
              onClick={() => setActiveTab('issues')}
              style={activeTab === 'issues' ? styles.bgPrimary : {}}
            >
              <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4M12 8h.01"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-2 truncate">Issues</span>}
            </Link>
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
          <Link
            to={currentProject?.id && `/projects/${currentProject.id}/wiki`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'wiki' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('wiki')}
            style={activeTab === 'wiki' ? styles.bgPrimary : {}}
          >
            <svg className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-2 truncate">Wiki</span>}
          </Link>
          <Link
            to={currentProject?.id && `/projects/${currentProject.id}/team`}
            className={`flex items-center justify-${sidebarCollapsed ? 'center' : 'start'} px-3 py-2 text-sm rounded-md ${activeTab === 'team' ? 'text-white' : 'text-gray-200 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('team')}
            style={activeTab === 'team' ? styles.bgPrimary : {}}
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
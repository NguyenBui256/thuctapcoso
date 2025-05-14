import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SettingsSidebar from './SettingsSidebar';
import SettingsContent from './SettingsContent';
import ProjectDetails from './ProjectSettings/ProjectDetails';
import Presets from './ProjectSettings/Presets';
import Modules from './ProjectSettings/Modules';
import Permissions from './PermissionsSettings/Permissions';
import Statuses from './Attributes/Statuses';
import Priorities from './Attributes/Priorities';
import Severities from './Attributes/Severities';
import Types from './Attributes/Types';
import Tags from './Attributes/Tags';

const SettingsPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Main sections for settings
  const [section, setSection] = useState('project'); // 'project', 'attributes', 'permissions'
  // Sub-sections
  const [subSection, setSubSection] = useState('details'); // For project: 'details', 'presets', 'modules'
                                                         // For attributes: 'statuses', 'points', etc.
                                                         // For permissions: role IDs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse settings from URL on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    const subSectionParam = searchParams.get('subsection');

    if (sectionParam) {
      setSection(sectionParam);
    }

    if (subSectionParam) {
      setSubSection(subSectionParam);
    } else {
      // Set default sub-section based on section
      if (sectionParam === 'project' || !sectionParam) {
        setSubSection('details');
      } else if (sectionParam === 'attributes') {
        setSubSection('statuses');
      } else if (sectionParam === 'permissions') {
        // Default to first role or generic permissions view
        setSubSection('roles');
      }
    }
  }, [location.search]);

  const handleSectionChange = (newSection) => {
    const searchParams = new URLSearchParams();
    searchParams.set('section', newSection);
    
    // Set default subsection for the selected section
    let defaultSubSection;
    if (newSection === 'project') {
      defaultSubSection = 'details';
    } else if (newSection === 'attributes') {
      defaultSubSection = 'statuses';
    } else if (newSection === 'permissions') {
      defaultSubSection = 'roles';
    }
    
    searchParams.set('subsection', defaultSubSection);
    navigate(`/projects/${projectId}/settings?${searchParams.toString()}`);
  };

  const handleSubSectionChange = (newSubSection) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('subsection', newSubSection);
    navigate(`/projects/${projectId}/settings?${searchParams.toString()}`);
  };

  // Render the appropriate content based on section and subsection
  const renderContent = () => {
    if (section === 'project') {
      if (subSection === 'details') {
        return <ProjectDetails projectId={projectId} />;
      } else if (subSection === 'presets') {
        return <Presets projectId={projectId} />;
      } else if (subSection === 'modules') {
        return <Modules projectId={projectId} />;
      }
    } else if (section === 'attributes') {
      if (subSection === 'statuses') {
        return <Statuses projectId={projectId} />;
      } else if (subSection === 'priorities') {
        return <Priorities projectId={projectId} />;
      } else if (subSection === 'severities') {
        return <Severities projectId={projectId} />;
      } else if (subSection === 'types') {
        return <Types projectId={projectId} />;
      } else if (subSection === 'tags') {
        return <Tags projectId={projectId} />;
      }
      // Placeholder for attributes subsections
      return <div className="p-6">Attributes - {subSection} settings (to be implemented)</div>;
    } else if (section === 'permissions') {
      // Handle new-role subsection
      if (subSection === 'new-role') {
        return <Permissions projectId={projectId} isNewRole={true} />;
      }
      // For numeric IDs, pass the roleId
      if (!isNaN(parseInt(subSection))) {
        return <Permissions projectId={projectId} roleId={parseInt(subSection)} />;
      }
      // Default to roles view with no specific role
      return <Permissions projectId={projectId} />;
    }
    
    return <div className="p-6">Select a section from the sidebar</div>;
  };

  return (
    <div className="flex h-screen">
      {/* Settings Secondary Sidebar */}
      <div className="h-screen flex-shrink-0">
        <SettingsSidebar 
          section={section}
          subSection={subSection}
          onSectionChange={handleSectionChange}
          onSubSectionChange={handleSubSectionChange}
          projectId={projectId}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading settings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md m-6">
            <p>Error: {error}</p>
          </div>
        ) : (
          <SettingsContent>
            {renderContent()}
          </SettingsContent>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 
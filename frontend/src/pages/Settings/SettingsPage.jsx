import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SettingsSidebar from './SettingsSidebar';
import SettingsContent from './SettingsContent';
import ProjectDetails from './ProjectSettings/ProjectDetails';
import Presets from './ProjectSettings/Presets';
import Modules from './ProjectSettings/Modules';
import Permissions from './PermissionsSettings/Permissions';

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
      // Placeholder for attributes subsections
      return <div className="p-6">Attributes - {subSection} settings (to be implemented)</div>;
    } else if (section === 'permissions') {
      return <Permissions projectId={projectId} roleId={subSection} />;
    }
    
    return <div className="p-6">Select a section from the sidebar</div>;
  };

  return (
    <div className="flex h-full">
      {/* Settings Secondary Sidebar */}
      <SettingsSidebar 
        section={section}
        subSection={subSection}
        onSectionChange={handleSectionChange}
        onSubSectionChange={handleSubSectionChange}
        projectId={projectId}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
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
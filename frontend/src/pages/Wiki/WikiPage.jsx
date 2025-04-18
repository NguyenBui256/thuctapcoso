import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import WikiSidebar from './WikiSidebar';
import WikiContent from './WikiContent';
import WikiPagesTable from './WikiPagesTable';
import { fetchWithAuth, getCurrentUserId } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

const WikiPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [wikiPages, setWikiPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'
  const userId = getCurrentUserId();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${projectId}`,
          `/projects/${projectId}/wiki`,
          true
        );
        if (response) {
          const data = await response.json();
          setProject(data);
        }
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      }
    };

    if (userId && projectId) {
      fetchProject();
    }
  }, [projectId, userId]);

  // Fetch all wiki pages
  useEffect(() => {
    const fetchWikiPages = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/wiki`,
          `/projects/${projectId}/wiki`,
          true
        );
        if (response) {
          const jsonResponse = await response.json();
          const pagesData = jsonResponse.data || [];
          const safePages = Array.isArray(pagesData) ? pagesData : [];
          setWikiPages(safePages);
        } else {
          setError('Failed to fetch wiki pages list');
        }
      } catch (err) {
        setError('Failed to load wiki pages list');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && projectId) {
      fetchWikiPages();
    }
  }, [projectId, userId]);

  // Effect to handle URL parameters and set view mode / selected page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageId = searchParams.get('page');
    const view = searchParams.get('view');

    if (view === 'all') {
      setViewMode('all');
      setSelectedPage(null);
    } else if (pageId) {
      const existingPage = wikiPages.find(p => p.id.toString() === pageId);
      if (existingPage) {
        setSelectedPage(existingPage);
        setViewMode('single');
      } else if (wikiPages.length > 0 || loading) {
        // Fetch only if pages are loaded or still loading
        fetchWikiPage(pageId);
      } else if (!loading) {
        setError(`Page with ID ${pageId} not found.`);
        setViewMode('single');
        setSelectedPage(null);
      }
    } else if (wikiPages.length > 0) {
      setSelectedPage(wikiPages[0]);
      setViewMode('single');
    } else {
      setViewMode('single');
      setSelectedPage(null);
    }
  }, [location.search, wikiPages, loading]);

  // Fetch a specific wiki page
  const fetchWikiPage = async (pageId) => {
    if (selectedPage && selectedPage.id.toString() === pageId) return; // Already selected
    
    setLoading(true); // Set loading specific to fetching a page
    try {
      console.log('Fetching specific page:', pageId);
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/wiki/${pageId}`,
        `/projects/${projectId}/wiki`,
        true
      );
      if (response && response.ok) {
        const data = await response.json();
        const pageData = data.data || data;
        setSelectedPage(pageData);
        setViewMode('single'); 
        setError(null); 
      } else {
        setError(`Failed to load page ${pageId}`);
        setSelectedPage(null);
        setViewMode('single');
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('page');
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true }); // Replace history
      }
    } catch (err) {
      setError(`Failed to load page ${pageId}`);
      console.error(err);
      setSelectedPage(null);
      setViewMode('single');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageId) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', pageId);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleDeletePage = async (pageId) => {
    try {
      console.log('Deleting page with ID:', pageId);
      
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/wiki/${pageId}`,
        `/projects/${projectId}/wiki`,
        true,
        { method: 'DELETE' }
      );
      
      if (response && response.ok) {
        console.log('Page deleted successfully');
        const remainingPages = wikiPages.filter(page => page.id !== pageId);
        setWikiPages(remainingPages);
        
        if (selectedPage && selectedPage.id === pageId) {
          if (remainingPages.length > 0) {
            handlePageSelect(remainingPages[0].id);
          } else {
            setSelectedPage(null);
            const searchParams = new URLSearchParams(location.search);
            searchParams.delete('page');
            navigate(`${location.pathname}?${searchParams.toString()}`);
          }
        }
      } else {
        console.error('Failed to delete page:', response.status);
        setError(`Failed to delete wiki page (HTTP ${response.status})`);
      }
    } catch (err) {
      setError('Failed to delete wiki page');
      console.error('Delete page error:', err);
    }
  };

  const handleUpdatePage = async (updatedPage) => {
    try {
      const pageRequest = {
        title: updatedPage.title,
        content: updatedPage.content || ''
      };
      
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/wiki/${updatedPage.id}`,
        `/projects/${projectId}/wiki`,
        true,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageRequest)
        }
      );
      
      if (response && response.ok) {
        const jsonResponse = await response.json();
        const updatedData = jsonResponse.data || jsonResponse;
        setSelectedPage(updatedData);
        setWikiPages(wikiPages.map(p => (p.id === updatedData.id ? updatedData : p)));
        setError(null); // Clear error on success
      } else {
        setError('Failed to update wiki page');
      }
    } catch (err) {
      setError('Failed to update wiki page');
      console.error(err);
    }
  };

  const handleCreatePage = async (newPage) => {
    try {
      const pageRequest = {
        title: newPage.title,
        content: newPage.content || ''
      };
      
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/wiki`,
        `/projects/${projectId}/wiki`,
        true,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageRequest)
        }
      );
      
      if (response && response.ok) {
        const jsonResponse = await response.json();
        const createdData = jsonResponse.data || jsonResponse;
        setWikiPages([...wikiPages, createdData]);
        handlePageSelect(createdData.id);
        setError(null); // Clear error on success
      } else {
        setError('Failed to create wiki page');
      }
    } catch (err) {
      setError('Failed to create wiki page');
      console.error(err);
    }
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'single' ? 'all' : 'single';
    const searchParams = new URLSearchParams();
    if (newMode === 'all') {
      searchParams.set('view', 'all');
    } else {
      const pageToSelect = selectedPage || (wikiPages.length > 0 ? wikiPages[0] : null);
      if (pageToSelect) {
        searchParams.set('page', pageToSelect.id);
      }
    }
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar 
          currentProject={project} 
          onToggleCollapse={setSidebarCollapsed} 
        />
        {/* Container for Wiki Sidebar + Content - Add positioning */}
        <div 
          className={`fixed top-12 right-0 transition-all duration-300 flex flex-1 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}
        >
          <WikiSidebar 
            className="h-[calc(100vh-3rem)] overflow-y-auto" // Keep height calc
            pages={wikiPages || []} 
            selectedPageId={selectedPage?.id}
            onSelectPage={handlePageSelect} 
            onDeletePage={handleDeletePage} 
            onCreatePage={handleCreatePage}
            onViewAllPages={toggleViewMode}
            viewMode={viewMode}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 h-[calc(100vh-3rem)] overflow-y-auto bg-gray-50 p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {viewMode === 'all' ? (
              <div>
                {loading && wikiPages.length === 0 ? (
                  <div className="text-center text-gray-500">Loading pages...</div>
                ) : (
                  <WikiPagesTable pages={wikiPages} projectId={projectId} />
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Wiki</h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleViewMode}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      View All Pages
                    </button>
                  </div>
                </div>
                {loading && !selectedPage ? ( // Show loading only if no page is selected yet
                  <div className="text-center text-gray-500">Loading page...</div>
                ) : selectedPage ? (
                  <WikiContent 
                    page={selectedPage} 
                    onUpdatePage={handleUpdatePage}
                    onDeletePage={handleDeletePage}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    {wikiPages.length > 0 ? 'Select a page from the sidebar.' : 'Create a new page to get started.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiPage; 
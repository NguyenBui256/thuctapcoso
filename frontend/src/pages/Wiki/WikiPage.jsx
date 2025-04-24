import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import WikiSidebar from './WikiSidebar';
import WikiContent from './WikiContent';
import WikiPagesTable from './WikiPagesTable';
import { fetchWithAuth, getCurrentUserId } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

const WikiPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [wikiPages, setWikiPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'
  const userId = getCurrentUserId();

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
        if (response && response.ok) {
          const jsonResponse = await response.json();
          console.log("Wiki pages complete response:", jsonResponse);

          // Extract the wiki pages array from the nested response structure
          let pagesArray = [];

          // Handle the nested structure jsonResponse.data.data
          if (jsonResponse.data && jsonResponse.data.data && Array.isArray(jsonResponse.data.data)) {
            console.log("Found pages in jsonResponse.data.data", jsonResponse.data.data);
            pagesArray = jsonResponse.data.data;
          }
          // Fallback to direct data if available (different API format)
          else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
            console.log("Found pages in jsonResponse.data", jsonResponse.data);
            pagesArray = jsonResponse.data;
          }
          // No pages found
          else {
            console.warn("Could not find wiki pages array in response. Response structure:", jsonResponse);
          }

          console.log("Final extracted pages array:", pagesArray);
          setWikiPages(pagesArray);
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
  }, [projectId, userId, location.search]);

  // Effect to handle URL parameters and set view mode / selected page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageId = searchParams.get('page');
    const view = searchParams.get('view');

    if (view === 'all') {
      setViewMode('all');
      setSelectedPage(null);
    } else if (pageId && pageId !== 'undefined') {
      const existingPage = wikiPages.find(p => p.id.toString() === pageId);
      if (existingPage) {
        setSelectedPage(existingPage);
        setViewMode('single');
      } else if (wikiPages.length > 0 || loading) {
        // Fetch only if pages are loaded or still loading
        fetchWikiPage(pageId);
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
    if (!pageId || pageId === 'undefined') {
      setError('Invalid page ID');
      setSelectedPage(null);
      return;
    }

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
    if (!pageId || pageId === 'undefined') {
      setError('Cannot delete page: Invalid page ID');
      return;
    }

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
    if (!updatedPage || !updatedPage.id) {
      setError('Cannot update page: Invalid page ID');
      return;
    }

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
    <div className="flex h-full w-full">
      {/* Wiki Sidebar */}
      <WikiSidebar
        className="flex-shrink-0 w-64 h-full flex-col overflow-y-auto border-r border-gray-200 bg-white"
        pages={wikiPages || []}
        selectedPageId={selectedPage?.id}
        onSelectPage={handlePageSelect}
        onDeletePage={handleDeletePage}
        onCreatePage={handleCreatePage}
        onViewAllPages={toggleViewMode}
        viewMode={viewMode}
      />

      {/* Main Wiki Content Area - Remove horizontal padding */}
      <div className="flex-1 h-full overflow-y-auto">
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
              <WikiPagesTable pages={wikiPages} projectId={projectId} loading={loading} />
            )}
          </div>
        ) : (
          <div className="mx-auto">
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
  );
};

export default WikiPage; 
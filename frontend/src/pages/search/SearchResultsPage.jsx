import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

export default function SearchResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const queryParams = new URLSearchParams(location.search);
    const initialSearchQuery = queryParams.get('query') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState({
        userStories: [],
        tasks: [],
        issues: [],
        wikiPages: []
    });
    const [activeTab, setActiveTab] = useState('userStories'); // Default active tab

    // Function to handle new search
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/projects/${projectId}/search/results?query=${encodeURIComponent(searchQuery)}`);

            // If the query is different from the current URL query, fetch new results
            if (searchQuery !== initialSearchQuery) {
                fetchSearchResults(searchQuery);
            }
        }
    };

    // Function to fetch search results
    const fetchSearchResults = (query) => {
        setIsLoading(true);

        fetchWithAuth(`${BASE_API_URL}/v1/search?projectId=${projectId}&query=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                const resultsData = {
                    userStories: data.data?.userStories || [],
                    tasks: data.data?.tasks || [],
                    issues: data.data?.issues || [],
                    wikiPages: data.data?.wikiPages || []
                };

                setResults(resultsData);

                // Set the first non-empty category as active tab
                const categories = ['userStories', 'tasks', 'issues', 'wikiPages'];
                for (const category of categories) {
                    if (resultsData[category] && resultsData[category].length > 0) {
                        setActiveTab(category);
                        break;
                    }
                }

                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                setIsLoading(false);
            });
    };

    // Fetch search results when the component mounts or when URL search query changes
    useEffect(() => {
        if (initialSearchQuery) {
            setSearchQuery(initialSearchQuery);
            fetchSearchResults(initialSearchQuery);
        }
    }, [initialSearchQuery, projectId]);

    // Calculate total results count
    const totalResults =
        results.userStories.length +
        results.tasks.length +
        results.issues.length +
        results.wikiPages.length;

    // Helper function to highlight the matched text
    const highlightMatch = (text, query) => {
        if (!query || !text) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={index} className="bg-yellow-200">{part}</span>
                : part
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Search</h1>

                {/* Search input */}
                <form onSubmit={handleSearch} className="mb-6 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded bg-white"
                        placeholder="Search again..."
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-md hover:bg-teal-600 text-sm font-medium"
                    >
                        SEARCH
                    </button>
                </form>

                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Searching...</p>
                    </div>
                ) : (
                    <div>
                        {/* Results header */}
                        <div className="mb-4 text-sm text-gray-600">
                            {totalResults === 0 ? (
                                <p>No results found for "{initialSearchQuery}"</p>
                            ) : (
                                <p>Found {totalResults} results for "{initialSearchQuery}"</p>
                            )}
                        </div>

                        {/* Results tabs */}
                        {totalResults > 0 && (
                            <div className="border-b border-gray-200 mb-6">
                                <div className="flex">
                                    {results.userStories.length > 0 && (
                                        <button
                                            className={`py-3 px-6 ${activeTab === 'userStories' ? 'border-b-2 border-teal-500 text-teal-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setActiveTab('userStories')}
                                        >
                                            User Stories ({results.userStories.length})
                                        </button>
                                    )}
                                    {results.tasks.length > 0 && (
                                        <button
                                            className={`py-3 px-6 ${activeTab === 'tasks' ? 'border-b-2 border-teal-500 text-teal-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setActiveTab('tasks')}
                                        >
                                            Tasks ({results.tasks.length})
                                        </button>
                                    )}
                                    {results.issues.length > 0 && (
                                        <button
                                            className={`py-3 px-6 ${activeTab === 'issues' ? 'border-b-2 border-teal-500 text-teal-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setActiveTab('issues')}
                                        >
                                            Issues ({results.issues.length})
                                        </button>
                                    )}
                                    {results.wikiPages.length > 0 && (
                                        <button
                                            className={`py-3 px-6 ${activeTab === 'wikiPages' ? 'border-b-2 border-teal-500 text-teal-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                            onClick={() => setActiveTab('wikiPages')}
                                        >
                                            Wiki Pages ({results.wikiPages.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* User Stories results */}
                        {activeTab === 'userStories' && results.userStories.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium mb-3">User Stories</h2>
                                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User Stories
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Points
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.userStories.map(story => (
                                                <tr key={story.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/projects/${projectId}/userstory/${story.id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-900"
                                                        >
                                                            #{story.id} {highlightMatch(story.name, initialSearchQuery)}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {story.uxPoints || story.backPoints || story.frontPoints || story.designPoints || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100"
                                                        >
                                                            {story.status?.name || 'Not Started'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tasks results */}
                        {activeTab === 'tasks' && results.tasks.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium mb-3">Tasks</h2>
                                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Task
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User Story
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Assigned To
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.tasks.map(task => (
                                                <tr key={task.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/projects/${projectId}/task/${task.id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-900"
                                                        >
                                                            #{task.id} {highlightMatch(task.name, initialSearchQuery)}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {task.userStoryId ? `#${task.userStoryId}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100"
                                                        >
                                                            {task.status?.name || 'Not Started'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {task.assigned?.fullName || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Issues results */}
                        {activeTab === 'issues' && results.issues.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium mb-3">Issues</h2>
                                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Issue
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Priority
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.issues.map(issue => (
                                                <tr key={issue.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/projects/${projectId}/issue/${issue.id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-900"
                                                        >
                                                            #{issue.id} {highlightMatch(issue.subject, initialSearchQuery)}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {issue.type?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100"
                                                        >
                                                            {issue.status?.name || 'Open'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {issue.priority?.name || 'Normal'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Wiki pages results */}
                        {activeTab === 'wikiPages' && results.wikiPages.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium mb-3">Wiki Pages</h2>
                                <div className="bg-white rounded-md shadow-sm">
                                    {results.wikiPages.map(wiki => (
                                        <div key={wiki.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                                            <Link
                                                to={`/projects/${projectId}/wiki?page=${wiki.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-900 text-lg"
                                            >
                                                {highlightMatch(wiki.title, initialSearchQuery)}
                                            </Link>
                                            {wiki.content && (
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                    {highlightMatch(wiki.content.replace(/<[^>]*>/g, ''), initialSearchQuery)}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Last updated: {new Date(wiki.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results message */}
                        {totalResults === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500 mb-4">No results found for "{initialSearchQuery}"</p>
                                <p className="text-gray-600 text-sm">Try adjusting your search terms or check your spelling</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getCurrentUserId } from '../../utils/AuthUtils';

const WikiPagesTable = ({ pages, projectId, loading = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  console.log("WikiPagesTable received pages:", pages);

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-taiga-primary">Wiki</h2>
        <span className="ml-2 text-gray-500 text-sm">All pages</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Editions
              </th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator
              </th>
              <th scope="col" className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last modifier
              </th>
              <th scope="col" className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading wiki pages...
                </td>
              </tr>
            ) : pages && pages.length > 0 ? (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/projects/${projectId}/wiki?page=${page.id}`}
                      className="text-taiga-primary hover:text-taiga-secondary break-words"
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {page.editCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {page.createdBy?.avatarUrl ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={page.createdBy.avatarUrl}
                            alt={page.createdByUsername}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-taiga-primary/30 flex items-center justify-center text-taiga-secondary">
                            {page.createdByUsername.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-taiga-primary">
                          <Link to={`/users/${getCurrentUserId()}`} className="hover:text-taiga-secondary">
                            {page.createdByUsername || 'Unknown'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(page.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {page.updatedBy?.avatarUrl ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={page.updatedBy.avatarUrl}
                            alt={page.updatedBy.fullName}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-taiga-primary/30 flex items-center justify-center text-taiga-secondary">
                            {page.updatedBy?.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-taiga-primary">
                          <Link to={`/users/${getCurrentUserId()}`} className="hover:text-taiga-secondary">
                            {page.updatedBy?.fullName || 'Unknown'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(page.updatedAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No wiki pages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WikiPagesTable; 
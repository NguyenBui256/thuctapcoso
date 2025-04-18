import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiEdit2, FiTrash2, FiDownload, FiUpload, FiX, FiSave } from 'react-icons/fi';
import { format } from 'date-fns';

const WikiContent = ({ page, onUpdatePage, onDeletePage, loading, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (page) {
      setEditContent(page.content || '');
      setEditTitle(page.title || '');
    }
  }, [page]);

  const handleSave = () => {
    if (page) {
      onUpdatePage({
        ...page,
        title: editTitle,
        content: editContent
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (page && window.confirm('Are you sure you want to delete this page?')) {
      onDeletePage && onDeletePage(page.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm');
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString || 'Not available';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-gray-500">No wiki page selected. Please select a page from the sidebar or create a new one.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {isEditing ? (
          <div className="bg-white rounded-md shadow-sm mb-6">
            <div className="p-4 border-b">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold border-b border-gray-200 pb-2 focus:outline-none focus:border-blue-500"
                placeholder="Page Title"
              />
            </div>
            <div className="p-4">
              <div className="toolbar border border-gray-200 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-2">
                <button className="p-1 hover:bg-gray-200 rounded" title="Bold" onClick={() => setEditContent(prev => prev + '**Bold Text**')}>
                  <span className="font-bold">B</span>
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Italic" onClick={() => setEditContent(prev => prev + '*Italic Text*')}>
                  <span className="italic">I</span>
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Heading" onClick={() => setEditContent(prev => prev + '\n## Heading\n')}>
                  H
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="List" onClick={() => setEditContent(prev => prev + '\n- List item\n- Another item\n')}>
                  •
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Link" onClick={() => setEditContent(prev => prev + '[Link Text](https://example.com)')}>
                  🔗
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Image" onClick={() => setEditContent(prev => prev + '\n![Image Alt](https://example.com/image.jpg)\n')}>
                  🖼️
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Code" onClick={() => setEditContent(prev => prev + '\n```\nCode block\n```\n')}>
                  {'</>'}
                </button>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 p-3 border border-gray-200 border-t-0 rounded-b-md focus:outline-none focus:border-blue-500"
                placeholder="Write your content here using Markdown..."
              />
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FiX className="mr-1" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <FiSave className="mr-1" /> Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{page.title || 'Untitled'}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <FiEdit2 className="mr-1" /> Edit
              </button>
            </div>
            <div className="bg-white rounded-md shadow-sm p-6 prose max-w-none">
              <ReactMarkdown>{page.content || 'No content yet.'}</ReactMarkdown>
            </div>
          </>
        )}

        {/* Page info card */}
        <div className="bg-white rounded-md shadow-sm mt-6 p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Last modified:</span> {formatDate(page.updatedAt)}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">By:</span> {page.updatedBy?.fullName || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Edit count:</span> {page.editCount || 0}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>
        
        {/* Attachments section */}
        <div className="bg-white rounded-md shadow-sm mt-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Attachments</h3>
            <button className="text-blue-500 hover:text-blue-600 flex items-center">
              <FiUpload className="mr-1" /> Upload
            </button>
          </div>
          
          {page.attachments && page.attachments.length > 0 ? (
            <div className="space-y-2">
              {page.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-700">{attachment.filename}</span>
                  <button className="text-blue-500 hover:text-blue-600">
                    <FiDownload size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No attachments yet. Upload files to attach them to this page.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WikiContent; 
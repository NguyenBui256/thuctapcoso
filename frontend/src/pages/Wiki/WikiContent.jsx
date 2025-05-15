import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiEdit2, FiTrash2, FiDownload, FiUpload, FiX, FiSave, FiFile } from 'react-icons/fi';
import { format } from 'date-fns';
import { BASE_API_URL } from '../../common/constants';
import { fetchWithAuth, getCurrentUserId } from '../../utils/AuthUtils';
import { toast } from 'react-toastify';
import axios from '../../common/axios-customize';
import { useParams } from 'react-router-dom';

const WikiContent = ({ page, onUpdatePage, onDeletePage, loading, error }) => {
  // Get projectId from URL params
  const { projectId } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (page) {
      setEditContent(page.content || '');
      setEditTitle(page.title || '');
    }
  }, [page]);

  // Handle keyboard shortcuts for formatting
  const handleKeyDown = useCallback((e) => {
    if (!e.ctrlKey) return;

    // Get the current selection in the textarea
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    let newText = editContent;
    let newCursorPos = end;

    switch (e.key.toLowerCase()) {
      case 'b': // Bold
        e.preventDefault();
        if (selectedText) {
          newText = editContent.substring(0, start) + '**' + selectedText + '**' + editContent.substring(end);
          newCursorPos = end + 4; // account for ** markers
        } else {
          newText = editContent.substring(0, start) + '**Bold Text**' + editContent.substring(end);
          newCursorPos = start + 12; // position cursor after insertion
        }
        break;
      case 'i': // Italic
        e.preventDefault();
        if (selectedText) {
          newText = editContent.substring(0, start) + '*' + selectedText + '*' + editContent.substring(end);
          newCursorPos = end + 2; // account for * markers
        } else {
          newText = editContent.substring(0, start) + '*Italic Text*' + editContent.substring(end);
          newCursorPos = start + 13; // position cursor after insertion
        }
        break;
      case 'k': // Link
        e.preventDefault();
        if (selectedText) {
          newText = editContent.substring(0, start) + '[' + selectedText + '](https://example.com)' + editContent.substring(end);
          newCursorPos = end + 21; // account for markup
        } else {
          newText = editContent.substring(0, start) + '[Link Text](https://example.com)' + editContent.substring(end);
          newCursorPos = start + 11; // position cursor after insertion
        }
        break;
      case 'q': // Quote
        e.preventDefault();
        if (selectedText) {
          newText = editContent.substring(0, start) + '> ' + selectedText + editContent.substring(end);
          newCursorPos = end + 2; // account for > marker
        } else {
          newText = editContent.substring(0, start) + '> Quote text' + editContent.substring(end);
          newCursorPos = start + 12; // position cursor after insertion
        }
        break;
      case 'c': // Code block (Ctrl+Shift+C)
        if (e.shiftKey) {
          e.preventDefault();
          if (selectedText) {
            newText = editContent.substring(0, start) + '```\n' + selectedText + '\n```' + editContent.substring(end);
            newCursorPos = end + 8; // account for code markers
          } else {
            newText = editContent.substring(0, start) + '```\nCode block\n```' + editContent.substring(end);
            newCursorPos = start + 16; // position cursor after insertion
          }
        }
        break;
      default:
        return; // Exit for other keys
    }

    setEditContent(newText);
    
    // Set cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [editContent]);

  const handleSave = () => {
    if (page) {
      // Create a copy to avoid reference issues
      const updatedPageData = {
        ...page,
        title: editTitle,
        content: editContent,
        // Add current timestamp to force UI update
        lastEditTime: new Date().getTime()
      };
      
      onUpdatePage(updatedPageData);
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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Function to get the most reliable project ID
  const getProjectId = () => {
    // First try URL params
    if (projectId && projectId !== 'undefined') {
      return projectId;
    }

    // Then try page object
    if (page && page.project && page.project.id) {
      return page.project.id;
    }

    // Finally try page.projectId
    if (page && page.projectId) {
      return page.projectId;
    }

    console.error('Cannot determine project ID for attachment upload');
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Get project ID first
    const effectiveProjectId = getProjectId();
    if (!effectiveProjectId) {
      toast.error('Cannot upload attachment: Project ID is missing');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `wiki/${page.id}`);

      // Determine the correct upload endpoint based on file type
      let uploadEndpoint = '/api/v1/files/upload/raw'; // Default for documents

      if (file.type.startsWith('image/')) {
        uploadEndpoint = '/api/v1/files/upload/image';
      } else if (file.type.startsWith('video/')) {
        uploadEndpoint = '/api/v1/files/upload/video';
      }

      // Use axios instead of fetchWithAuth for file uploads
      const uploadResponse = await axios.post(uploadEndpoint, formData);

      if (uploadResponse.data) {
        const cloudinaryData = uploadResponse.data;

        // Now save the attachment to the wiki page
        const attachmentData = {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          url: cloudinaryData.secure_url || cloudinaryData.url
        };

        const attachResponse = await fetchWithAuth(
          `${BASE_API_URL}/v1/user/${getCurrentUserId()}/project/${effectiveProjectId}/wiki/${page.id}/attachment`,
          null,
          true,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attachmentData)
          }
        );

        if (attachResponse && attachResponse.ok) {
          const updatedPageData = await attachResponse.json();
          console.log('Attachment response data:', updatedPageData); // Debug log

          // Phản hồi từ API có cấu trúc lồng nhau: { status, message, data }
          // Trích xuất dữ liệu từ phản hồi đúng cách
          let pageData = null;

          if (updatedPageData.data) {
            // Nếu có trường data (cấu trúc API chuẩn)
            pageData = updatedPageData.data;
          } else if (updatedPageData.status === 'success' && updatedPageData.data) {
            // Kiểm tra cấu trúc phản hồi khác
            pageData = updatedPageData.data;
          } else {
            // Sử dụng dữ liệu trực tiếp nếu không có cấu trúc lồng nhau
            pageData = updatedPageData;
          }

          // Nếu dữ liệu trả về không có ID, sử dụng ID từ trang hiện tại
          if (pageData && !pageData.id && page && page.id) {
            pageData.id = page.id;
          }

          // Bảo đảm dữ liệu trang không bị mất
          if (pageData) {
            // Giữ lại tiêu đề nếu không có trong dữ liệu trả về
            if (!pageData.title && page && page.title) {
              pageData.title = page.title;
            }

            // Giữ lại nội dung nếu không có trong dữ liệu trả về
            if (!pageData.content && page && page.content) {
              pageData.content = page.content;
            }
          }

          // Nếu không có tệp đính kèm trong dữ liệu trả về, bổ sung tệp đính kèm mới
          if (pageData && (!pageData.attachments || !Array.isArray(pageData.attachments))) {
            pageData.attachments = [...(page.attachments || [])];
            // Thêm tệp đính kèm mới vào mảng
            pageData.attachments.push({
              filename: attachmentData.filename,
              url: attachmentData.url,
              contentType: attachmentData.contentType,
              fileSize: attachmentData.fileSize
            });
          }

          // Cập nhật trang với dữ liệu hợp lệ
          if (pageData) {
            onUpdatePage(pageData);
            toast.success('File attached successfully!');
          } else {
            // Cập nhật trực tiếp tệp đính kèm vào trang hiện tại nếu không thể trích xuất dữ liệu từ phản hồi
            const updatedAttachments = [...(page.attachments || []), {
              filename: attachmentData.filename,
              url: attachmentData.url,
              contentType: attachmentData.contentType,
              fileSize: attachmentData.fileSize
            }];

            // Bảo đảm giữ lại tất cả dữ liệu của trang hiện tại
            onUpdatePage({
              ...page,
              title: page.title || '',  // Đảm bảo giữ lại tiêu đề
              content: page.content || '',  // Đảm bảo giữ lại nội dung
              attachments: updatedAttachments
            });
            toast.success('File attached successfully!');
          }
        } else {
          toast.error('Failed to attach file to wiki page');
        }
      } else {
        toast.error('Failed to upload file to cloud storage');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Error uploading file: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadAttachment = (attachment) => {
    try {
      // Xác định nếu là loại file đặc biệt cần xử lý đặc biệt (pdf, doc, docx, xls, xlsx)
      const fileExt = attachment.filename.split('.').pop().toLowerCase();
      const specialTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

      if (attachment.contentType && attachment.contentType.startsWith('image/')) {
        // Đối với hình ảnh, mở trong tab mới
        window.open(attachment.url, '_blank');
      } else if (specialTypes.includes(fileExt)) {
        // Với các loại file đặc biệt, chúng ta sử dụng fetch để lấy blob
        fetch(attachment.url)
          .then(response => response.blob())
          .then(blob => {
            // Tạo một URL tạm thời từ blob và tên file gốc
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', attachment.filename);
            document.body.appendChild(link);
            link.click();
            // Giải phóng URL sau khi tải xuống
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            }, 100);
          })
          .catch(err => {
            console.error('Error downloading file:', err);
            toast.error('Failed to download file. Try again or contact admin.');
            // Fallback to direct open
            window.open(attachment.url, '_blank');
          });
      } else {
        // Với các loại file khác, sử dụng phương pháp tải xuống thông thường
        const link = document.createElement('a');
        link.href = attachment.url;
        link.setAttribute('download', attachment.filename);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error in download handler:', error);
      toast.error('Failed to download file');
      // Fallback to direct open
      window.open(attachment.url, '_blank');
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
      <div className="p-6">
        {isEditing ? (
          <div className="bg-white rounded-md shadow-sm mb-6">
            <div className="p-4 border-b">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold border-b border-gray-200 pb-2 focus:outline-none focus:border-taiga-primary"
                placeholder="Page Title"
              />
            </div>
            <div className="p-4">
              <div className="toolbar border border-gray-200 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-2">
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Bold (Ctrl + B)" onClick={() => setEditContent(prev => prev + '**Bold Text**')}>
                  <span className="font-bold">B</span>
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Italic (Ctrl + I)" onClick={() => setEditContent(prev => prev + '*Italic Text*')}>
                  <span className="italic">I</span>
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Heading" onClick={() => setEditContent(prev => prev + '\n## Heading\n')}>
                  H
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="List" onClick={() => setEditContent(prev => prev + '\n- List item\n- Another item\n')}>
                  •
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Link (Ctrl + K)" onClick={() => setEditContent(prev => prev + '[Link Text](https://example.com)')}>
                  🔗
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Image" onClick={() => setEditContent(prev => prev + '\n![Image Alt](https://example.com/image.jpg)\n')}>
                  🖼️
                </button>
                <button className="p-1 hover:bg-taiga-light-gray rounded" title="Code (Ctrl + Shift + C)" onClick={() => setEditContent(prev => prev + '\n```\nCode block\n```\n')}>
                  {'</>'}
                </button>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 p-3 border border-gray-200 border-t-0 rounded-b-md focus:outline-none focus:border-taiga-primary"
                placeholder="Write your content here using Markdown..."
                ref={textareaRef}
                onKeyDown={handleKeyDown}
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
                className="px-4 py-2 bg-taiga-primary text-white rounded-md hover:brightness-90 flex items-center"
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
                className="px-3 py-1 bg-taiga-primary text-white rounded-md hover:brightness-90 flex items-center"
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
            <button
              className="text-taiga-primary hover:text-taiga-secondary flex items-center"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : (
                <>
                  <FiUpload className="mr-1" /> Upload
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </div>

          {page.attachments && page.attachments.length > 0 ? (
            <div className="space-y-2">
              {page.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FiFile className="mr-2 text-taiga-primary" />
                    <span className="text-gray-700">{attachment.filename}</span>
                  </div>
                  <button
                    className="text-taiga-primary hover:text-taiga-secondary"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
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
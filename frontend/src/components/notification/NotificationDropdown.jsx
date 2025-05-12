import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from "react-icons/io5";
import { FiCheck, FiX } from 'react-icons/fi';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';
import { formatDistance } from 'date-fns';

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Set up polling for notifications (check every 30 seconds)
  useEffect(() => {
    // Initial fetch
    if (userId) {
      fetchNotifications();
    }

    // Set up polling
    const intervalId = setInterval(() => {
      if (userId) {
        fetchNotifications(true); // silent refresh
      }
    }, 30000); // 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Separate function to calculate unread count
  const calculateUnreadCount = (notificationList) => {
    return notificationList.filter(notification => notification.isSeen === false).length;
  };

  // Function to sort notifications - sort by creation time (most recent first)
  const sortNotifications = (notifications) => {
    if (!Array.isArray(notifications)) return [];

    return [...notifications].sort((a, b) => {
      // Sort by creation time (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const fetchNotifications = async (silent = false) => {
    if (!userId) return;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/notifications`,
        '/login',
        true,
        { method: 'GET' }
      );

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch notifications: ${response?.statusText || 'Unknown error'}`);
      }

      // Safely parse JSON response
      let result;
      try {
        const text = await response.text();
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Invalid response format: ${parseError.message}`);
      }

      // Process data based on API response structure
      let notificationList = [];

      if (result && result.data) {
        notificationList = result.data;
      } else if (Array.isArray(result)) {
        notificationList = result;
      } else {
        console.warn('Unexpected response format:', result);
        notificationList = [];
      }

      // Sort notifications - sort by creation time (most recent first)
      const sortedNotifications = sortNotifications(notificationList);

      // Update state with the sorted notifications
      setNotifications(sortedNotifications);

      // Calculate and update unread count
      const unread = calculateUnreadCount(notificationList);
      setUnreadCount(unread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (!silent) {
        setError(error.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as seen if not already
    if (notification.isSeen === false) {
      try {
        await fetchWithAuth(
          `${BASE_API_URL}/v1/user/${userId}/notifications/${notification.id}/seen`,
          '/login',
          true,
          { method: 'PUT' }
        );

        // Update local state
        setNotifications(prev => {
          const updated = prev.map(n => n.id === notification.id ? { ...n, isSeen: true } : n);
          return sortNotifications(updated);
        });

        // Recalculate unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as seen:', error);
      }
    }
  };

  const handleMarkAsUnread = async (e, notification) => {
    e.stopPropagation(); // Prevent triggering parent click event

    // Don't allow PROJECT_INVITE notifications to be marked as unread once seen
    if (notification.type === "PROJECT_INVITE" && notification.isSeen === true) {
      return;
    }

    if (notification.isSeen === true) {
      try {
        // We'll use the same endpoint but toggle the status in the frontend
        // since there's no direct "mark as unread" endpoint

        // Update local state first for immediate feedback
        setNotifications(prev => {
          const updated = prev.map(n => n.id === notification.id ? { ...n, isSeen: false } : n);
          return sortNotifications(updated);
        });

        // Increase unread count
        setUnreadCount(prev => prev + 1);

      } catch (error) {
        console.error('Error marking notification as unread:', error);
      }
    }
  };

  const handleAcceptInvitation = async (notification) => {
    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/notifications/${notification.id}/accept-invitation`,
        '/login',
        true,
        { method: 'POST' }
      );

      if (!response || !response.ok) {
        throw new Error('Failed to accept invitation');
      }

      // Update notification in state to reflect acceptance
      setNotifications(prev =>
        prev.filter(n => n.id !== notification.id)
      );

      // Recalculate unread count
      if (notification.isSeen === false) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Refresh notifications
      fetchNotifications(true);

      // Navigate to the project if needed
      if (notification.objectId) {
        navigate(`/projects/${notification.objectId}`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation: ' + error.message);
    }
  };

  const handleRejectInvitation = async (notification) => {
    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/notifications/${notification.id}/reject-invitation`,
        '/login',
        true,
        { method: 'POST' }
      );

      if (!response || !response.ok) {
        throw new Error('Failed to reject invitation');
      }

      // Update notification in state
      setNotifications(prev =>
        prev.filter(n => n.id !== notification.id)
      );

      // Recalculate unread count
      if (notification.isSeen === false) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Refresh notifications
      fetchNotifications(true);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation: ' + error.message);
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Unknown';

      // Format as hh:mm dd/MM/yyyy
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();

      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const renderNotificationItem = (notification) => {
    const isProjectInvite = notification.type === "PROJECT_INVITE";
    const isUnread = notification.isSeen === false;
    const canMarkAsUnread = notification.isSeen === true && notification.type !== "PROJECT_INVITE";

    return (
      <div
        key={notification.id}
        className={`p-3 border-b hover:bg-gray-50 ${isUnread ? 'bg-blue-50' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="text-sm flex justify-between">
          <div className="font-medium text-gray-800 flex-grow">
            {isUnread && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            )}
            {notification.description}
          </div>
          {canMarkAsUnread && (
            <button
              onClick={(e) => handleMarkAsUnread(e, notification)}
              className="ml-2 px-2 text-xs rounded text-blue-500 hover:underline"
              title="Mark as unread"
            >
              Mark unread
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex justify-between">
          <span>{formatNotificationTime(notification.createdAt)}</span>
          {notification.createdByUsername && (
            <span>
              From: {notification.createdByFullName || notification.createdByUsername}
            </span>
          )}
        </div>

        {isProjectInvite && isUnread && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptInvitation(notification);
              }}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
            >
              <FiCheck className="mr-1" /> Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRejectInvitation(notification);
              }}
              className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
            >
              <FiX className="mr-1" /> Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="cursor-pointer text-2xl p-2 text-blue-600 hover:text-gray-700 rounded-full relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <IoNotificationsOutline />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-[70vh] overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600">{unreadCount} unread</span>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p className="mb-2">{error}</p>
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => fetchNotifications()}
              >
                Try Again
              </button>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(renderNotificationItem)
          ) : (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          )}

          <div className="p-2 text-center">
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => fetchNotifications()}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 
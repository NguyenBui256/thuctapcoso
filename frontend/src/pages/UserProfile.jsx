import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/DateUtils';
import { getUserInitials } from '../utils/UserUtils';
import { UserApi } from '../api/UserApi';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');
    const [contacts, setContacts] = useState([]);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [assignedUserStories, setAssignedUserStories] = useState([]);
    const [completedUserStories, setCompletedUserStories] = useState([]);
    const [userStoriesLoading, setUserStoriesLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let userProfile;
                if (userId) {
                    userProfile = await UserApi.getUserProfile(userId);
                } else {
                    userProfile = await UserApi.getCurrentUserProfile();
                }
                if (!userProfile.error) {
                    setProfile(userProfile.data);
                } else {
                    console.error('Error fetching profile:', userProfile.message);
                }

                // Fetch contacts and assigned user stories in parallel
                if (userId) {
                    UserApi.getUserContacts(userId)
                        .then(data => setContacts(Array.isArray(data) ? data : (data?.data ?? [])));
                    UserApi.getAssignedUserStories(userId)
                        .then(data => {
                            const stories = Array.isArray(data) ? data : (data?.data ?? []);
                            setAssignedUserStories(stories);
                            setCompletedUserStories(stories.filter(story => story.statusClosed));
                        });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleEditBio = () => {
        navigate('/account/settings');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border text-taiga-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    const renderTimeline = () => {
        if (!profile?.timeline || profile.timeline.length === 0) {
            return (
                <div className="text-center text-gray-500 py-10">
                    <p className="text-lg">No activity found</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {profile.timeline.map((notification, index) => (
                    <div key={index} className="py-6 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-start gap-4">
                            <Link to={notification.createdBy?.id ? `/users/${notification.createdBy.id}` : '#'}>
                                <div className="h-14 w-14 bg-purple-200 rounded-full flex items-center justify-center text-lg">
                                    {getUserInitials(notification.createdBy?.fullName || notification.createdBy?.username || '')}
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link to={notification.createdBy?.id ? `/users/${notification.createdBy.id}` : '#'} className="font-medium text-gray-900 text-lg">
                                            {notification.createdBy?.fullName || notification.createdBy?.username}
                                        </Link>
                                        <div className="text-gray-600 text-base">{notification.description}</div>
                                    </div>
                                </div>
                                <div className="text-md text-gray-500 mt-2">{formatDate(notification.createdAt)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderContacts = () => {
        if (contactsLoading) {
            return (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            );
        }

        if (contacts.length === 0) {
            return (
                <div className="text-center text-gray-500 py-10">
                    <p className="text-lg">No contacts found</p>
                </div>
            );
        }

        return (
            <ul className="divide-y divide-gray-200">
                {contacts.map(contact => (
                    <li key={contact.id} className="py-6">
                        <Link to={`/users/${contact.id}`} className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-full bg-purple-200 flex items-center justify-center text-lg">
                                {getUserInitials(contact.fullName || contact.username)}
                            </div>
                            <div>
                                <div className="font-medium text-lg">{contact.fullName}</div>
                                <div className="text-gray-500 text-base">@{contact.username}</div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    const renderCompletedUserStories = () => {
        if (userStoriesLoading) {
            return (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            );
        }

        if (completedUserStories.length === 0) {
            return (
                <div className="text-center text-gray-500 py-10">
                    <p className="text-lg">No completed user stories found</p>
                </div>
            );
        }

        return (
            <ul className="divide-y divide-gray-200">
                {completedUserStories.map(story => (
                    <li key={story.id} className="py-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {story.projectId ? (
                                    <Link to={`/projects/${story.projectId}/userstory/${story.id}`} className="font-medium text-teal-700 hover:text-teal-800 text-lg">
                                        {story.name}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-teal-700 text-lg">{story.name}</span>
                                )}
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                                        {story.statusName}
                                    </span>
                                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
                                        ID: {story.id}
                                    </span>
                                </div>
                            </div>
                            {story.projectId && (
                                <Link to={`/projects/${story.projectId}`} className="text-teal-500 hover:text-teal-600 text-base font-medium">
                                    View Project
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-full">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left column with profile details */}
                <div className="md:w-1/3">
                    <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <div className="w-64 h-64 mx-auto bg-purple-200 mb-6">
                            {profile?.photoUrl ? (
                                <img
                                    src={profile.photoUrl}
                                    alt={profile.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold">
                                    {getUserInitials(profile?.fullName || profile?.username)}
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-center text-blue-500 mb-1">
                            {profile?.fullName}
                        </h1>
                        <p className="text-gray-500 text-center text-xl mb-4">@{profile?.username}</p>

                        <p className="text-gray-600 font-medium text-center text-lg mb-4">
                            {profile?.role || 'Product Owner'}, {profile?.organization || ''}
                        </p>

                        <div className="flex justify-between text-center mt-6">
                            <div className="w-1/3">
                                <div className="text-xl font-bold text-gray-800">{profile?.totalProjects || 0}</div>
                                <div className="text-xs text-gray-500">Projects</div>
                            </div>
                            <div className="w-1/3 border-x border-gray-200">
                                <div className="text-xl font-bold text-gray-800">{completedUserStories.length || 0}</div>
                                <div className="text-xs text-gray-500">Closed</div>
                            </div>
                            <div className="w-1/3">
                                <div className="text-xl font-bold text-gray-800">{contacts.length || 0}</div>
                                <div className="text-xs text-gray-500">Contacts</div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <div className="text-gray-400 text-sm mb-2">{profile?.company || ''}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-medium mb-4">Your profile</h2>
                        <p className="text-gray-600 mb-4">
                            {profile?.bio || 'People can see everything you do and what you are working on. Add a nice bio to give an enhanced version of your information.'}
                        </p>
                        <button
                            onClick={handleEditBio}
                            className="w-full py-2 bg-teal-100 text-teal-600 rounded-md hover:bg-teal-200 transition"
                        >
                            EDIT BIO
                        </button>
                        <div className="mt-8">
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
                                </svg>
                                <span className="text-gray-700 font-medium">Hint</span>
                            </div>
                            <p className="text-gray-600 text-sm">Did you know you can create custom fields?</p>
                            <p className="text-gray-600 text-sm mt-4">
                                Teams can now create custom fields as a flexible means to enter specific data useful for
                                their particular workflow. <Link to="#" className="text-teal-500 hover:underline">If you want to know how to use it visit our support page</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right column with tabs and content */}
                <div className="md:w-2/3">
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`px-4 py-3 font-medium text-sm ${activeTab === 'timeline' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setActiveTab('contacts')}
                                    className={`px-4 py-3 font-medium text-sm ${activeTab === 'contacts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                        Contacts
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('completedUserStories')}
                                    className={`px-4 py-3 font-medium text-sm ${activeTab === 'completedUserStories' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Closed User Stories
                                    </div>
                                </button>
                            </nav>
                        </div>

                        <div className="p-8">
                            {activeTab === 'timeline' && renderTimeline()}
                            {activeTab === 'contacts' && renderContacts()}
                            {activeTab === 'completedUserStories' && renderCompletedUserStories()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile; 
import { checkAuthenticated, logout } from "../utils/AuthUtils"
import { Link } from "react-router-dom"
import logo from '/icons/logo-nav.svg'
import { useEffect, useState, useRef } from "react"
import { FiFolder, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { AiOutlineCompass } from "react-icons/ai";
import { renderAvatar } from '../utils/UserUtils'
import NotificationDropdown from '../components/notification/NotificationDropdown';
import axios from '../common/axios-customize';
import userSettingsService from '../services/userSettingsService';

export default function Navbar() {
    const [authenticated, setAuthenticated] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const projectDropdownRef = useRef(null);

    const setAuth = async () => {
        const auth = await checkAuthenticated();
        setAuthenticated(auth);
        if (auth) {
            // Get userData from localStorage
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            setUserData(storedUserData);

            // Fetch latest user settings to ensure avatar is updated
            try {
                // Get user settings from the correct endpoint
                const userSettingsResponse = await userSettingsService.getUserSettings();
                console.log("User settings response:", userSettingsResponse);

                if (userSettingsResponse && userSettingsResponse.data) {
                    // Get avatar from user_settings
                    const settingsData = userSettingsResponse.data;
                    const avatarUrl = settingsData.photoUrl || settingsData.avatar;

                    console.log("Found avatar URL in settings:", avatarUrl);

                    if (storedUserData && avatarUrl && avatarUrl !== storedUserData.avatarUrl) {
                        console.log("Updating avatar in localStorage from user settings");
                        const updatedUserData = { ...storedUserData, avatarUrl: avatarUrl };
                        localStorage.setItem('userData', JSON.stringify(updatedUserData));
                        setUserData(updatedUserData);
                    }
                }
            } catch (error) {
                console.error('Error fetching user settings:', error);
            }

            // Fetch user projects
            try {
                // Use correct API endpoint with proper path
                const response = await axios.get('/api/v1/projects/joined');
                console.log("Projects API response:", response);

                if (response && response.data) {
                    // Handle both array and object responses
                    const projectsData = Array.isArray(response.data) ? response.data :
                        (response.data.content ? response.data.content :
                            (response.data.data ? response.data.data : []));

                    // Log for debugging
                    console.log("Formatted projects data:", projectsData);

                    // Set at most 4 projects
                    setUserProjects(projectsData.slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching user projects:', error);
            }
        }
    }

    useEffect(() => {
        setAuth();
    }, []);

    // Effect to update userData whenever localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            setUserData(storedUserData);
        };

        // Listen for storage changes (for when other components update localStorage)
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Close project dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Custom avatar rendering for navbar
    const renderUserAvatar = () => {
        if (!userData) return null;

        if (!userData.avatarUrl) {
            return (
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                    {userData.username?.charAt(0)?.toUpperCase() || userData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
            );
        }

        return (
            <img
                src={userData.avatarUrl}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
            />
        );
    };

    return (
        <div className="h-12 bg-gray-200 flex items-center fixed top-0 left-0 right-0 z-50">
            {authenticated ? (
                <div className="w-full">
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center space-x-2">
                            <div className="p-1">
                                <Link
                                    to='/'
                                >
                                    <img
                                        src={logo}
                                        className='w-9'
                                    />
                                </Link>
                            </div>
                            <div className="relative" ref={projectDropdownRef}>
                                <div
                                    className="flex items-center text-blue-500 hover:text-blue-700 cursor-pointer ml-2"
                                    onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                                >
                                    <FiFolder className="text-lg mr-1" />
                                    <span className="font-medium">Dự án</span>
                                    <FiChevronDown className="ml-1" />
                                </div>

                                {isProjectsOpen && (
                                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                        <div className="p-2">
                                            {userProjects.length > 0 ? (
                                                <>
                                                    {userProjects.map(project => (
                                                        <Link
                                                            key={project.id}
                                                            to={`/projects/${project.id}`}
                                                            className="flex items-center p-2 hover:bg-gray-100 rounded"
                                                        >
                                                            <div className="w-6 h-6 mr-2 bg-blue-100 rounded flex items-center justify-center text-blue-500">
                                                                {project.iconUrl ? (
                                                                    <img src={project.iconUrl} alt={project.name} className="w-4 h-4" />
                                                                ) : (
                                                                    <span>{project.name.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-700">{project.name}</span>
                                                        </Link>
                                                    ))}
                                                    <div className="border-t my-2"></div>
                                                </>
                                            ) : (
                                                <div className="p-2 text-gray-500 text-sm">No projects found</div>
                                            )}

                                            <Link
                                                to="/projects/manage"
                                                className="block p-2 text-teal-500 hover:text-teal-700 hover:underline"
                                            >
                                                View all projects
                                            </Link>

                                            <Link
                                                to="/projects/new"
                                                className="block p-2 mt-2 bg-teal-200 hover:bg-teal-300 text-center rounded-md"
                                            >
                                                <span className="font-medium flex items-center justify-center">
                                                    <span className="mr-1">+</span> NEW PROJECT
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex gap-2 pr-10 border-r border-white">
                                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                    <AiOutlineCompass className="text-2xl" />
                                </button>

                                <button className="cursor-pointer text-2xl p-2 text-blue-600 hover:text-gray-700 rounded-full">
                                    <FiHelpCircle />
                                </button>

                                {/* NotificationDropdown Component */}
                                {userData && userData.userId && (
                                    <NotificationDropdown userId={userData.userId} />
                                )}
                            </div>

                            <div className="relative mr-3 group">
                                <button
                                    className="cursor-pointer flex items-center space-x-1"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <Link
                                        to={`/users/${userData?.userId}`}
                                        className="w-8 h-8 rounded-full flex items-center justify-center border-4 border-blue-400 hover:border-gray-400"
                                    >
                                        {renderUserAvatar()}
                                    </Link>
                                    <FiChevronDown className="transition-transform duration-200 group-hover:transform group-hover:rotate-180" />
                                </button>

                                <div className={`absolute -right-5 -mt-2 
                                    transform origin-top-right transition-all duration-300 ease-in-out
                                    ${isProfileOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible'}`}
                                    style={{ zIndex: 9999 }}
                                >
                                    <div className="h-4">
                                    </div>
                                    <div className="navbar-dropdown bg-white rounded-md shadow-lg border border-gray-200" style={{ zIndex: 9999, position: 'relative' }}>
                                        <div className="p-4 ">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                                                    {userData?.avatarUrl ? (
                                                        <img
                                                            src={userData.avatarUrl}
                                                            alt="User avatar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white">
                                                            {userData?.username?.charAt(0)?.toUpperCase() || userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-semibold">{userData?.fullName}</div>
                                                    <div className="text-sm text-gray-500">{userData?.email}</div>
                                                    <a
                                                        href="/account/settings"
                                                        className=" text-blue-500 text-sm hover:underline mt-1"
                                                    >
                                                        Sửa hồ sơ
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Paid Plans</a>
                                            <a href="/account/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Account settings</a>
                                            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Notifications</a>
                                        </div>
                                        <div className="border-t border-gray-200 py-1">
                                            <button
                                                className="w-full text-left cursor-pointer px-4 py-2 text-blue-500 hover:bg-gray-100"
                                                onClick={logout}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-between items-center">
                    <div className="p-1">
                        <Link
                            to='/'
                        >
                            <img
                                src={logo}
                                className='w-9'
                            />
                        </Link>
                    </div>

                    <div className="flex gap-4 mr-5 text-sm text-blue-700 font-semibold items-center">
                        <Link
                            to='/login'
                            className="hover:text-blue-400"
                        >
                            Đăng nhập
                        </Link>

                        <Link
                            to='/register'
                            className="hover:text-blue-400"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
import { checkAuthenticated, logout } from "../utils/AuthUtils"
import { Link } from "react-router-dom"
import logo from '/icons/logo-nav.svg'
import { useEffect, useState } from "react"
import { FiFolder, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { AiOutlineCompass } from "react-icons/ai";
import { renderAvatar } from '../utils/UserUtils'
import NotificationDropdown from '../components/notification/NotificationDropdown';

export default function Navbar() {
    const [authenticated, setAuthenticated] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));

    const setAuth = async () => {
        const auth = await checkAuthenticated();
        setAuthenticated(auth);
    }

    useEffect(() => {
        setAuth();
    }, []);

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
                            <div className="flex items-center text-blue-500 hover:text-blue-700 cursor-pointer ml-2">
                                <FiFolder className="text-lg mr-1" />
                                <span className="font-medium">
                                    <Link to='/projects'>Dự án</Link>
                                </span>
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
                                        to={'#'}
                                        className="w-8 h-8 rounded-full flex items-center justify-center border-4 border-blue-400 hover:border-gray-400"
                                    >
                                        {renderAvatar(userData.avatarUrl, true)}
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
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                                    {renderAvatar(userData.avatarUrl, true)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-semibold">{userData.fullName}</div>
                                                    <div className="text-sm text-gray-500">{userData.email}</div>
                                                    <a
                                                        href="/"
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
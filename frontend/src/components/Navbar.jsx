import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiSettings, FiLogOut } from 'react-icons/fi';

const NavigationBar = () => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('userData'));
        setUserData(data);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">TTCS</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">{t('common.myProjects')}</Nav.Link>
                        <Nav.Link as={Link} to="/projects/new">{t('common.newProject')}</Nav.Link>
                    </Nav>
                    <Nav>
                        <NavDropdown title={t('common.settings')} id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/account/settings">{t('settings.accountSettings')}</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/settings/notifications">{t('settings.notificationSettings')}</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/logout">{t('common.logout')}</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                        >
                            {userData?.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt="User avatar"
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                    {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <FiChevronDown className="h-5 w-5" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                {userData && (
                                    <>
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-medium text-gray-900">{userData.fullName}</p>
                                            <p className="text-xs text-gray-500">{userData.email}</p>
                                        </div>
                                        <Link
                                            to="/account/settings"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <FiSettings className="mr-2" />
                                            {t('settings.accountSettings')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <FiLogOut className="mr-2" />
                                            {t('common.logout')}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar; 
import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavigationBar = () => {
    const { t } = useTranslation();

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
                            <NavDropdown.Item as={Link} to="/settings/account">{t('settings.accountSettings')}</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/settings/notifications">{t('settings.notificationSettings')}</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/logout">{t('common.logout')}</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar; 
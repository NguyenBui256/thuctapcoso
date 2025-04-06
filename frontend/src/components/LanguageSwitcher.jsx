import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown } from 'react-bootstrap';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="light" id="language-dropdown">
                {i18n.language === 'en' ? 'English' : 'Tiếng Việt'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('vi')}>Tiếng Việt</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher; 
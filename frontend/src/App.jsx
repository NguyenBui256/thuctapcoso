import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import SelectProjectType from './components/SelectProjectType';
import CreateProject from './components/CreateProject';
import DuplicateProject from './components/DuplicateProject';
import AccountSettings from './components/account/AccountSettings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Add margin-top to account for fixed header */}
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<SelectProjectType />} />
            <Route path="/projects/create/:projectType" element={<CreateProject />} />
            <Route path="/projects/duplicate" element={<DuplicateProject />} />
            <Route path="/account/settings" element={<AccountSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

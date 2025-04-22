import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

const LoginPage = lazy(() => import('./pages/auth/login'));
const RegisterPage = lazy(() => import('./pages/auth/register'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
import { ERROR_TYPE } from './pages/ErrorPage.jsx';
import React from 'react';
import ProjectList from './components/project/ProjectList.jsx';
import SelectProjectType from './components/project/SelectProjectType.jsx';
import CreateProject from './components/project/CreateProject.jsx';
import DuplicateProject from './components/project/DuplicateProject.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import MainLayout from './pages/MainLayout.jsx';
import ProjectDetail from './pages/project_detail/ProjectDetail.jsx';
import HandleOauthRedirect from './pages/auth/HandleOauthRedirect.jsx';
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/forgot-password/ResetPasswordPage.jsx';
import KanbanBoardWrapper from './components/kanban/KanbanBoardWrapper.jsx';
import TaigaUserStoryDetail from './components/kanban/TaigaUserStoryDetail';
import TaigaTaskDetail from './components/kanban/TaigaTaskDetail.jsx';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/oauth/redirect' element={<HandleOauthRedirect />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
      <Route path='/' element={<MainLayout />}>
        <Route path="/" />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<SelectProjectType />} />
        <Route path="/projects/create/:projectType" element={<CreateProject />} />
        <Route path="/projects/duplicate" element={<DuplicateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/kanban" element={<KanbanBoardWrapper />} />
        <Route path="/projects/:projectId/userstory/:userStoryId" element={<TaigaUserStoryDetail />} />
        <Route path="/task/:taskId" element={<TaigaTaskDetail />} />
        <Route path="/account/settings" element={<AccountSettings />} />
      </Route>
      <Route path='*' element={<ErrorPage errorType={ERROR_TYPE.NOT_FOUND} />} />
    </Routes>
  );
}

export default App;
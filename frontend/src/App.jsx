import { lazy } from 'react';

const LoginPage = lazy(() => import('./pages/auth/login'));
const RegisterPage = lazy(() => import('./pages/auth/register'));
const MainLayout = lazy(() => import('./pages/MainLayout'))
const HandleOauthRedirect = lazy(() => import('./pages/auth/HandleOauthRedirect'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/forgot-password/ResetPasswordPage'))
const ErrorPage = lazy(() => import('./pages/ErrorPage.jsx'));
const ProjectDetail = lazy(() => import('./pages/project_detail/ProjectDetail'));

import { ERROR_TYPE } from './pages/ErrorPage.jsx';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './components/project/ProjectList.jsx';
import SelectProjectType from './components/project/SelectProjectType.jsx';
import CreateProject from './components/project/CreateProject.jsx';
import DuplicateProject from './components/project/DuplicateProject.jsx';
import AccountSettings from './components/account/AccountSettings';

function App() {

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/oauth/redirect' element={<HandleOauthRedirect />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
      <Route path='/' element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<SelectProjectType />} />
        <Route path="/projects/create/:projectType" element={<CreateProject />} />
        <Route path="/projects/duplicate" element={<DuplicateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/account/settings" element={<AccountSettings />} />
      </Route>
      <Route path='*' element={<ErrorPage errorType={ERROR_TYPE.NOT_FOUND} />} />
    </Routes>
  )
}

export default App
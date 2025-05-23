import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = lazy(() => import('./pages/auth/login'));
const RegisterPage = lazy(() => import('./pages/auth/register'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const ProjectDetailLayout = lazy(() => import('./components/layout/ProjectDetailLayout.jsx'))
const HandleOauthRedirect = lazy(() => import('./pages/auth/HandleOauthRedirect'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/forgot-password/ResetPasswordPage'))
const ProjectDetail = lazy(() => import('./pages/project_detail/ProjectDetail'));
const WikiPage = lazy(() => import('./pages/Wiki/WikiPage'));
const TeamPage = lazy(() => import('./pages/project_detail/TeamPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const MainLayout = lazy(() => import('./pages/MainLayout.jsx'))
const BacklogPage = lazy(() => import('./pages/scrum/BacklogPage'));
const SprintPage = lazy(() => import('./pages/scrum/SprintPage.jsx'))
const IssueList = lazy(() => import('./pages/issue/IssueList.jsx'))
const IssueDetail = lazy(() => import('./pages/issue/IssueDetail.jsx'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute.jsx'));
const ProjectMemberRoute = lazy(() => import('./components/auth/ProjectMemberRoute.jsx'));
const SearchPage = lazy(() => import('./pages/search/SearchPage.jsx'));
const SearchResultsPage = lazy(() => import('./pages/search/SearchResultsPage.jsx'));
const ProjectsDashboard = lazy(() => import('./pages/ProjectsDashboard.jsx'));
const ManageProjects = lazy(() => import('./pages/ManageProjects.jsx'));

import { ERROR_TYPE } from './pages/ErrorPage.jsx';
import React from 'react';
import ProjectList from './components/project/ProjectList.jsx';
import SelectProjectType from './components/project/SelectProjectType.jsx';
import CreateProject from './components/project/CreateProject.jsx';
import DuplicateProject from './components/project/DuplicateProject.jsx';
import AccountSettings from './components/account/AccountSettings.jsx';
import KanbanBoardWrapper from './components/kanban/KanbanBoardWrapper.jsx';
import TaigaUserStoryDetail from './components/kanban/TaigaUserStoryDetail';
import TaigaTaskDetail from './components/kanban/TaigaTaskDetail';
import UserProfile from './pages/UserProfile.jsx';

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/oauth/redirect' element={<HandleOauthRedirect />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
        <Route path='/' element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsDashboard />} />
          <Route path="/projects/manage" element={<ManageProjects />} />
          <Route path="/projects/list" element={<ProjectList />} />
          <Route path="/projects/new" element={<SelectProjectType />} />
          <Route path="/projects/create/:projectType" element={<CreateProject />} />
          <Route path="/projects/duplicate" element={<DuplicateProject />} />
          <Route path="/projects/:projectId" element={
            <ProjectMemberRoute>
              <ProjectDetailLayout />
            </ProjectMemberRoute>
          }>
            <Route path="/projects/:projectId/kanban" element={<KanbanBoardWrapper />} />
            <Route path="/projects/:projectId/userstory/:userStoryId" element={<TaigaUserStoryDetail />} />
            <Route path="/projects/:projectId/task/:taskId" element={<TaigaTaskDetail />} />
            <Route index element={<ProjectDetail />} />
            <Route path="wiki" element={<WikiPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="backlog" element={<BacklogPage />} />
            <Route path="backlog/userstory/:userStoryId" element={<TaigaUserStoryDetail />} />
            <Route path="sprint/:sprintId" element={<SprintPage />} />
            <Route path='issues' element={<IssueList />} />
            <Route path='issue/:issueId' element={<IssueDetail />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="search/results" element={<SearchResultsPage />} />
          </Route>
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/users/:userId" element={<UserProfile />} />
        </Route>
        <Route path='*' element={<ErrorPage errorType={ERROR_TYPE.NOT_FOUND} />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
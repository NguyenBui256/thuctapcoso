import {Routes, Route} from 'react-router-dom';
import { lazy } from 'react';

const LoginPage = lazy(() => import('./pages/auth/login'));
const RegisterPage = lazy(() => import('./pages/auth/register'));
const MainLayout = lazy(() => import('./pages/MainLayout'))
const HandleOauthRedirect= lazy(() => import('./pages/auth/HandleOauthRedirect'))
const ForgotPasswordPage= lazy(() => import('./pages/auth/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage= lazy(() => import('./pages/auth/forgot-password/ResetPasswordPage'))
const ErrorPage = lazy(() => import('./pages/ErrorPage.jsx'));

import { ERROR_TYPE } from './pages/ErrorPage.jsx';

function App() {

  return (
    <Routes>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path='/oauth/redirect' element={<HandleOauthRedirect/>}/>
      <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
      <Route path='/reset-password/:token' element={<ResetPasswordPage/>}/>
      <Route path='/' element={<MainLayout/>}>
        
      </Route>
      <Route path='*' element={<ErrorPage errorType={ERROR_TYPE.NOT_FOUND}/>}/>
    </Routes>
  )
}

export default App
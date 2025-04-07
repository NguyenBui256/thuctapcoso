import React, { useState, useEffect } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import logo from '/icons/logo-color.svg'
import { Link } from 'react-router-dom';
import { OpenOauthLoginPage } from '../../../utils/Oauth2Utils'
import { checkAuthenticated, setUserData } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const LoginPage = () => {

  useEffect(() => {
    const check = async () => {
      const authenticated = await checkAuthenticated()
      if (authenticated) window.location.assign("/")
    }

    check()
  }, [])

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')
    const body = {
      login: login,
      password: password
    }

    try {
      const res = await fetch(`${BASE_API_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      const data = await res.json();


      if (!res.ok) {
        setError(res.data.message || 'Đăng nhập thất bại')
        return
      }

      console.log(data.data.token);

      // Check if token exists in response
      if (!data.data.token) {
        setError('Không nhận được token từ server')
        return
      }

      localStorage.setItem('access_token', data.data.token)
      setUserData(data.data.token)

      // Check if we're properly authenticated before redirecting
      const isAuthenticated = await checkAuthenticated()
      if (isAuthenticated) {
        window.location.assign('/')
      } else {
        setError('Không thể xác thực người dùng')
      }
    } catch {
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.')
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        {/* Logo */}
        <a
          href='/'
          className="mb-4"
        >
          <img
            src={logo}
            className='w-30'
          />
        </a>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tagai</h1>

        <h2 className="text-xl text-gray-700 mb-7">LOVE YOUR PROJECT</h2>

        {error && (
          <p className='text-red-500'>{error}</p>
        )}

        <form onSubmit={handleSubmit} className="w-full mt-2">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username hoặc email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link to="/forgot-password" className="absolute right-2 top-3 text-sm text-gray-500 hover:text-teal-500">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full py-2 rounded bg-teal-400 hover:bg-teal-500 text-white font-medium transition duration-200"
          >
            ĐĂNG NHẬP
          </button>
        </form>

        <div className="mt-4 w-full">
          <p className="text-center text-gray-600 mb-2">Hoặc</p>

          <button
            className="cursor-pointer w-full mb-2 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded flex items-center justify-center"
            onClick={() => OpenOauthLoginPage('github')}
          >
            <FaGithub size={20} className="mr-2" />
            ĐĂNG NHẬP VỚI GITHUB
          </button>

          <button
            className="cursor-pointer w-full py-2 bg-gray-700 hover:bg-gray-800 text-white rounded flex items-center justify-center"
            onClick={() => OpenOauthLoginPage('google')}
          >
            <FaGoogle size={20} className="mr-2" />
            ĐĂNG NHẬP VỚI GOOGLE
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
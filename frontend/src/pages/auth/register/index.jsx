import React, { useEffect, useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import logo from '/icons/logo-color.svg'
import { Link } from 'react-router-dom';
import { OpenOauthLoginPage } from '../../../utils/Oauth2Utils'
import { checkAuthenticated, setUserData } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';
import { toast } from 'react-toastify';

const RegisterPage = () => {

  useEffect(() => {
    const check = async () => {
      const authenticated = await checkAuthenticated()
      if (authenticated) window.location.assign("/")
    }

    check()
  }, [])

  const [registerInfo, setRegisterInfo] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    retypePassword: ''
  })

  const [error, setError] = useState('')

  const handleChangeRegisterInfo = (attrName, value) => {
    setRegisterInfo(prev => ({
      ...prev,
      [attrName]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('')
    if (registerInfo.password !== registerInfo.retypePassword) {
      setError("Mật khẩu nhập lại không trùng khớp")
      toast.error("Mật khẩu nhập lại không trùng khớp");
      return
    }
    const body = {
      username: registerInfo.username,
      fullName: registerInfo.fullName,
      email: registerInfo.email,
      password: registerInfo.password
    }

    fetch(`${BASE_API_URL}/v1/auth/register`, {
      method: "POST",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(res => {
        if (res.message) {
          setError(res.message)
          toast.error(res.message);
        }
        else {
          localStorage.setItem('access_token', res.token)
          setUserData(res.token)
          toast.success('Đăng ký thành công!');
          window.location.assign('/')
        }
      })
      .catch(() => {
        setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.')
        toast.error('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
      })
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        <a
          href='/'
          className="mb-4"
        >
          <img
            src={logo}
            className='w-30'
          />
        </a>

        <h1 className="text-3xl font-bold text-gray-800 mb-7">Tagai</h1>

        {error && (
          <p className='text-red-500 text-sm'>{error}</p>
        )}

        <form onSubmit={handleSubmit} className="w-full mt-2">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={registerInfo.username}
              onChange={(e) => handleChangeRegisterInfo('username', e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Họ tên"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={registerInfo.fullName}
              onChange={(e) => handleChangeRegisterInfo('fullName', e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={registerInfo.email}
              onChange={(e) => handleChangeRegisterInfo('email', e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={registerInfo.password}
              onChange={(e) => handleChangeRegisterInfo('password', e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={registerInfo.retypePassword}
              onChange={(e) => handleChangeRegisterInfo('retypePassword', e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full py-2 rounded bg-teal-400 hover:bg-teal-500 text-white font-medium transition duration-200"
          >
            ĐĂNG KÝ
          </button>
        </form>

        <div className="mt-4 w-full">
          <p className="text-center text-gray-600 mb-2">Hoặc đăng nhập với</p>

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
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
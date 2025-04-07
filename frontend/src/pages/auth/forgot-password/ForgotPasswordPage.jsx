import React, { useState } from 'react';
import logo from '/icons/logo-color.svg'
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../common/constants';
import Loading from '../../Loading'

export default function ForgotPasswordPage(){

    const [login, setLogin] = useState('')
    const [error, setError] = useState('')
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('')
        setProcessing(true)
        document.activeElement.blur()
        fetch(`${BASE_API_URL}/v1/auth/forgot-password`, {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                login: login
            })
        })
            .then(res => res.json())
            .then(res => {
                if(res.message) setError(res.message)
                else setSuccess(true)
            })
            .finally(() => setProcessing(false))
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
        
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Tagai</h1>

                <h2 className="text-xl font-semibold text-gray-800 mb-2">Lấy lại mật khẩu</h2>
                
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
                    
                    <button 
                        type="submit" 
                        className="cursor-pointer w-full py-2 rounded bg-teal-400 hover:bg-teal-500 text-white font-medium transition duration-200"
                    >
                        Xác nhận
                    </button>
                </form>
            </div>

            <div className="mt-6 text-center">
                <Link 
                    to="/login" 
                    className="text-blue-600 hover:underline"
                >
                    Quay lại đăng nhập
                </Link>
            </div>

            {success && (
                <div className="fixed inset-0 w-full z-10 flex flex-col items-center justify-center bg-gray-50/90">
                    <h2
                        className='text-2xl font-bold mb-3'
                    >
                        Xác nhận thành công
                    </h2>
                    <h3
                        className='text-xl mb-3'
                    >
                        Thư đã được gửi tới địa chỉ email của bạn, hãy kiểm tra để đặt lại mật khẩu
                    </h3>
                    <Link 
                        to='/login'
                        className="cursor-pointer p-2 rounded bg-teal-400 hover:bg-teal-500 text-white font-medium transition duration-200"
                    >
                        Đồng ý
                    </Link>
                </div>
            )}

            {processing && <Loading/>}
        </div>
      );
}
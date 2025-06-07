import React, { useContext, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function GoogleLoginPage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const login = useGoogleLogin({
    scope:
      'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/spreadsheets https://mail.google.com/',
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = await res.json();

        const userData = {
          ...profile,
          access_token: tokenResponse.access_token,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/scheduler'); // or DriveSearch if that’s the landing page
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    },
    onError: () => console.error('Google Login Failed'),
  });


  // Load user from localStorage if exists
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br ">
      <div className="bg-white p-8 rounded-2xl shadow-wrap w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Đăng nhập bằng Google
        </h1>

        {!user ? (
          <div className="flex justify-center">
            <button
              className="bg-blue-500 font-semibold text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => login()}
            >
              Đăng nhập bằng Google
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <img
              src={user.picture}
              alt="avatar"
              className="w-16 h-16 rounded-full mx-auto"
            />
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

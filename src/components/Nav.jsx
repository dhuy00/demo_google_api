import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext';

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(UserContext)

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); 
    navigate('/')
  };


  return (
    <div className='fixed top-0 flex justify-between px-8 w-full py-4 shadow-wrap'>
      <span className='font-bold text-blue-500 text-lg'>Demo GoogleAPI</span>
      <ul className='flex gap-8 font-medium text-gray-500'>
        <li className={`${location.pathname === "/drive" ? "text-blue-500" : ''}`}>
          <a href='/drive'>
            Google Drive API
          </a>
        </li>
        <li className={`${location.pathname === "/scheduler" ? "text-blue-500" : ''}`}>
          <a href='/scheduler'>
            Google Calendar API
          </a>
        </li>
        <li className={`${location.pathname === "/receipt" ? "text-blue-500" : ''}`}>
          <a href='/receipt'>
            Google Vision API
          </a>
        </li>
      </ul>
      {
        !user ? (
          <div>
            <button className='font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-[6px] rounded-md'>
              Đăng nhập
            </button>
          </div>
        ) :
          (
            <button className='font-medium bg-red-500 hover:bg-red-600 text-white px-4 py-[6px] rounded-md'
            onClick={handleLogout}>
              Đăng xuất
            </button>
          )
      }

    </div>
  )
}

export default Nav

import React from 'react';
import Scheduler from './pages/Scheduler.jsx';
import Nav from './components/Nav';
import { Routes, Route } from 'react-router-dom';
import DriveSearch from './pages/DriveSearch';
import ReceiptOCR from './pages/RecieptOCR';
import GoogleLoginPage from './pages/GoogleLoginPage.jsx';


export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path='/' element={<GoogleLoginPage />} />
        <Route path='/scheduler' element={<Scheduler />} />
        <Route path='/drive' element={<DriveSearch />} />
        <Route path='/receipt' element={<ReceiptOCR />} />
      </Routes>
    </>
  );
}

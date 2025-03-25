import { useState } from 'react'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import './App.css'
import Layout  from './layout/Layout';
import  Home  from './pages/Home.jsx';

function App() {

  return (
   <BrowserRouter>
      <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path='/' element={<Layout/>} >
          <Route path='/home' element={<Home />} />
        </Route>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='landing' element={<LandingPage/>}></Route>
      </Routes>
   </BrowserRouter>
  )
}

export default App

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import './App.css'
import Layout  from './layout/Layout';
import  Home  from './pages/Home.jsx';
import { Toaster } from 'sonner';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import Protected from './layout/AuthLayout.jsx'
import AskQuestion from './pages/AskQuestion.jsx'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position='top-center'/>
      <BrowserRouter future={{ 
        v7_relativeSplatPath: true,
        v7_startTransition: true 
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<Protected authentication={true}><Layout/></Protected>}>
            <Route path='home' element={<Protected authentication={true}><Home /></Protected>} />
            <Route path='ask-question' element={<Protected authentication={true}><AskQuestion /></Protected>} />
          </Route>
          <Route path='login' element={<Protected authentication={false}><LoginPage/></Protected>} />
          <Route path='signup' element={<Protected authentication={false}><SignupPage/></Protected>} />
          <Route path='landing' element={<Protected authentication={false}><LandingPage/></Protected>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

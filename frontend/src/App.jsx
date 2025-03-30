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
import UserInfoForm from './pages/UserInfoForm.jsx'

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
          {/* Public Routes */}
          <Route path="/landing" element={<Protected authentication={false}><LandingPage/></Protected>} />
          <Route path="/login" element={<Protected authentication={false}><LoginPage/></Protected>} />
          <Route path="/signup" element={<Protected authentication={false}><SignupPage/></Protected>} />
          
          {/* Protected Routes */}
          <Route element={<Protected authentication={true}><Layout/></Protected>}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ask-question" element={<AskQuestion />} />
            <Route path="/complete-profile" element={<UserInfoForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Question from './pages/Question';
import Answer from './pages/Answer';
import AnswerForm from './components/AnswerForm';
import AskQuestion from './pages/AskQuestion';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserInfoForm from './pages/UserInfoForm';
import LandingPage from './pages/LandingPage';
import MyQuestions from './pages/MyQuestions';
import MyCollege from './pages/MyCollege';
import AllColleges from './pages/AllColleges';
import { Toaster } from 'sonner';
import Protected from './layout/AuthLayout'
import EditQuestion from './pages/EditQuestion'

function App() {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <Routes>
          {/* Public Routes - Protected from authenticated users */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={
            <Protected authentication={false}>
              <LoginPage />
            </Protected>
          } />
          <Route path="/signup" element={
            <Protected authentication={false}>
              <SignupPage />
            </Protected>
          } />
          
          {/* Profile completion route - protected from completed profiles */}
          <Route path="/complete-profile" element={
            <Protected authentication={true}>
              <UserInfoForm />
            </Protected>
          } />

          {/* Root path redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="/question/:id/edit" element={<EditQuestion />} />
            <Route path="/question/:id/answer" element={<AnswerForm />} />
            <Route path="/question/:id/answer/:answerId" element={<Answer />} />
            <Route path="/ask-question" element={<AskQuestion />} />
            <Route path="/my-questions" element={<MyQuestions />} />
            <Route path="/my-college" element={<MyCollege />} />
            <Route path="/all-colleges" element={<AllColleges />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;

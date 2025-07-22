import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,   
  Navigate,
} from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Answer from "./pages/Answer";
import AnswerForm from "./pages/AnswerForm";
import AskQuestion from "./pages/AskQuestion";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserInfoForm from "./pages/UserInfoForm";
import LandingPage from "./pages/LandingPage";
import MyQuestions from "./pages/MyContent";
import MyCollege from "./pages/MyCollege";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import ContactUs from "./pages/ContactUs";
import { Toaster } from "sonner";
import Protected from "./layout/AuthLayout";
import EditQuestion from "./pages/EditQuestion";
import EditAnswer from "./pages/EditAnswer";
import ForgotPassword from "./pages/ForgotPassword";
import LearnMorePage from "./pages/LearnMorePage";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import NotFoundPage from "./pages/NotFoundPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import VerificationPage from "./pages/VerificationPage";
import ProfileCompletionDialog from "./components/ProfileCompletionDialog";
import FlashCardsPage from "./pages/FlashCardsPage";
import Promotion from "./pages/Promotion";
import ChangePassword from "./pages/ChangePasswordPage.jsx";
import Leaderboard from "./pages/Leaderboard";

(function deleteStaleLocalStorage() {
  let removed = false;
  if (
    localStorage.getItem("authStatus") ||
    localStorage.getItem("profileCompleted") ||
    localStorage.getItem("userData")
  ) {
    localStorage.removeItem("authStatus");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("userData");
    removed = true;
  }
  // Remove any localStorage item that starts with 'firebase:authUser'
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("firebase:authUser")) {
      localStorage.removeItem(key);
      removed = true;
    }
  });
  // Set a flag so this runs only once
  if (removed && !localStorage.getItem("localStorageCleanupDone")) {
    localStorage.setItem("localStorageCleanupDone", "true");
  }
})();

// Root path redirect component
function RootRedirect() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return <Navigate to={isAuthenticated ? "/home" : "/landing"} replace />;
}

function App() {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    if (isMac) {
      document.body.style.zoom = "110%";
    }
  }, []);

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-gray-900 scrollbar-dark" : "bg-gray-50 scrollbar-light"}`}
    >
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Root path */}
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/landing"
            element={
              <Protected authentication={false}>
                <LandingPage />
              </Protected>
            }
          />
          <Route
            path="/about"
            element={
              <Protected authentication={false}>
                <LearnMorePage />
              </Protected>
            }
          />
          <Route
            path="/login"
            element={
              <Protected authentication={false}>
                <LoginPage />
              </Protected>
            }
          />
          <Route
            path="/signup"
            element={
              <Protected authentication={false}>
                <SignupPage />
              </Protected>
            }
          />
          <Route
            path="/verificationDialogue"
            element={
              <Protected authentication={true}>
                <VerificationPage />
              </Protected>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <Protected authentication={true}>
                <OtpVerificationPage />
              </Protected>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Protected authentication={false}>
                <ForgotPassword />
              </Protected>
            }
          />

          {/* Profile completion route - protected from completed profiles */}
          <Route
            path="/complete-profile"
            element={
              <Protected authentication={true}>
                <UserInfoForm />
              </Protected>
            }
          />

          {/* Protected Routes */}
          <Route element={<Protected authentication={true} />}>
            <Route element={<Layout />}>
              <Route path="home" element={<Home />} />
              <Route path="question">
                <Route path=":id" element={<Question />} />
                <Route path=":id/edit" element={<EditQuestion />} />
                <Route path=":id/answer" element={<AnswerForm />} />
                <Route path=":id/answer/:answerId" element={<Answer />} />
              </Route>
              <Route path="answer/:id/edit" element={<EditAnswer />} />
              <Route path="ask-question" element={<AskQuestion />} />
              <Route path="my-content" element={<MyQuestions />} />
              <Route path="flashcards">
                <Route index element={<FlashCardsPage />} />
                <Route path=":cardIndex" element={<FlashCardsPage />} />
              </Route>
              <Route path="my-college" element={<MyCollege />} />
              <Route path="profile" element={<Profile />} />
              <Route path="search/:query" element={<SearchResults />} />
              <Route
                path="customer-support"
                element={<CustomerSupportPage />}
              />
              <Route path="contact" element={<ContactUs />} />
              <Route path="promotion" element={<Promotion />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
          </Route>

          {/* Public Routes */}
          <Route element={<Protected authentication={false} />}>
            <Route path="landing" element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="verificationDialogue" element={<VerificationPage />} />
            <Route path="verify-otp" element={<OtpVerificationPage />} />
            <Route path="complete-profile" element={<UserInfoForm />} />
            <Route path="/reset-password/:token" element={<ChangePassword />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        richColors
        theme={isDarkMode ? "dark" : "light"}
        toastOptions={{
          style: {
            background: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
          },
        }}
      />
    </div>
  );
}

export default App;

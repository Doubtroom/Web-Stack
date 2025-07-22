import React, { useState, useEffect } from "react";
import InputField from "../components/InputField";
import { Mail, Lock } from "lucide-react";
import Button from "../components/ButtonAuth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  sendOtp,
  fetchUser,
  setAuth,
  googleLogin,
} from "../store/authSlice";
import { toast } from "sonner";
import VerificationPrompt from "../components/VerificationPrompt";
import { motion } from "framer-motion";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import GoogleLoginButton from "../components/GoogleLoginButton";
import LottieLoader from "../components/LottieLoader";
import { imageLinks } from "../config/assetConfig";
import SpaceToast from "../components/SpaceToast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const { loading, error } = useSelector((state) => state.auth);
  const [isVerificationPromptOpen, setIsVerificationPromptOpen] =
    useState(false);
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
  const [loginState, setLoginState] = useState({
    isProcessing: false,
    step: "idle", // idle -> logging -> fetching -> updating -> navigating
    error: null,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Monitor auth state changes
  const authState = useSelector((state) => state.auth);
  useEffect(() => {
    if (loginState.step === "updating" && authState.isAuthenticated) {
      setLoginState((prev) => ({ ...prev, step: "navigating" }));
    }
  }, [authState.isAuthenticated]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = () => {
    setIsVerificationPromptOpen(false);
    dispatch(sendOtp(formData.email));
    navigate("/verify-otp", {
      replace: true,
      state: { email: formData.email },
    });
  };

  const handleNewAccount = () => {
    setIsVerificationPromptOpen(false);
    navigate("/signup");
  };

  const handleClosePrompt = () => {
    setIsVerificationPromptOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) {
      return false;
    }

    if (loginState.isProcessing) return;

    setLoginState({
      isProcessing: true,
      step: "logging",
      error: null,
    });

    try {
      // Step 1: Login
      const result = await dispatch(login(formData)).unwrap();
      if (!result.user.isVerified) {
        setIsVerificationPromptOpen(true);
        setLoginState({
          isProcessing: false,
          step: "idle",
          error: null,
        });
        return;
      }

      // Show SpaceToast for daily login if awarded
      if (result.dailyLoginAwarded) {
        toast.custom((t) => (
          <SpaceToast amount={1} action="login" />
        ));
      }

      // Step 2: Fetch fresh user data
      setLoginState((prev) => ({ ...prev, step: "fetching" }));
      const userResult = await dispatch(fetchUser()).unwrap();

      // Step 3: Update auth state
      setLoginState((prev) => ({ ...prev, step: "updating" }));
      dispatch(
        setAuth({
          isAuthenticated: true,
          isVerified: true,
          user: userResult,
        }),
      );

      // Step 4: Check profile completion
      const hasCompleteProfile = Boolean(
        userResult.branch &&
          userResult.studyType &&
          userResult.gender &&
          userResult.role &&
          userResult.collegeName &&
          userResult.dob,
      );

      // Step 5: Navigate based on profile completion
      if (hasCompleteProfile) {
        navigate("/home", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }

      toast.success("Logged in successfully!",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
    } catch (error) {
      toast.error(error || "Login failed. Please try again.",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
      setLoginState({
        isProcessing: false,
        step: "idle",
        error: error,
      });
    }
  };

  // Google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google login failed. No credential received.",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
      return;
    }
    setLoginState({ isProcessing: true, step: "logging", error: null });
    try {
      const result = await dispatch(
        googleLogin(credentialResponse.credential),
      ).unwrap();
      
      // Show SpaceToast for daily login if awarded
      if (result.dailyLoginAwarded) {
        toast.custom((t) => (
          <SpaceToast amount={1} action="login" />
        ));
      }
      
      // Fetch user data after Google login
      setLoginState((prev) => ({ ...prev, step: "fetching" }));
      const userResult = await dispatch(fetchUser()).unwrap();
      setLoginState((prev) => ({ ...prev, step: "updating" }));
      dispatch(
        setAuth({
          isAuthenticated: true,
          isVerified: true,
          user: userResult,
        }),
      );
      

      
      // Check profile completion
      const hasCompleteProfile = Boolean(
        userResult.branch &&
          userResult.studyType &&
          userResult.gender &&
          userResult.role &&
          userResult.collegeName &&
          userResult.dob,
      );
      if (hasCompleteProfile) {
        navigate("/home", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }
      toast.success("Logged in with Google!",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
    } catch (error) {
      toast.error(error || "Google login failed. Please try again.",{
        style: { 
          background: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      });
      setLoginState({ isProcessing: false, step: "idle", error });
    }
  };

  if (loading || loginState.isProcessing) {
    return <LottieLoader text="Logging in..." fullScreen />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageLinks.authBackground}
            alt="login bg"
            className="w-full h-full object-cover object-center opacity-60 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-white/60 to-purple-100/40 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-blue-900/60" />
        </div>
        <VerificationPrompt
          isOpen={isVerificationPromptOpen}
          onClose={handleClosePrompt}
          onVerify={handleVerify}
          onNewAccount={handleNewAccount}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8 sm:p-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-blue-800`}
        >
          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-bold mb-2 drop-shadow-sm ${isDarkMode ? "text-white" : "text-blue-900"}`}
            >
              Welcome back
            </h1>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Login to your account to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <InputField
                type="email"
                id="email"
                label="Email"
                placeholder="Enter your email"
                icon={
                  <Mail
                    size={18}
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  />
                }
                value={formData.email}
                error={errors.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-6">
              <InputField
                type="password"
                id="password"
                label="Password"
                placeholder="Enter your password"
                icon={
                  <Lock
                    size={18}
                    className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                  />
                }
                value={formData.password}
                error={errors.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-6">
              <Button
                text="Login"
                variant="primary"
                fullWidth
                isLoading={loading || loginState.isProcessing}
                loadingText={`${
                  loginState.step === "logging"
                    ? "Logging in..."
                    : loginState.step === "fetching"
                      ? "Loading user data..."
                      : loginState.step === "updating"
                        ? "Updating session..."
                        : "Please wait..."
                }`}
                type="submit"
              />
            </div>
            <div className="mb-6 flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed", {
                  style: { 
                    background: isDarkMode ? "#1f2937" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#000000"
                  }
                })}
                useOneTap
                render={({ onClick, disabled }) => (
                  <GoogleLoginButton
                    onClick={onClick}
                    disabled={disabled || loading || loginState.isProcessing}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-center">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;

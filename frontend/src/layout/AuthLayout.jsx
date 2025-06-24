import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { fetchUser, setAuth } from '../store/authSlice.js';
import { fetchFlashcardStatuses } from '../store/flashcardStatusSlice.js';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ProfileCompletionDialog from '../components/ProfileCompletionDialog.jsx';
import config from '../config/config.js';

axios.defaults.withCredentials = true;

function Protected({ children, authentication = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated);
    const isVerified = useSelector((state) => state?.auth?.isVerified);
    const user = useSelector((state) => state?.auth?.user);
    const [hasAllDetails, setHasAllDetails] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isUserDetailsChecked, setIsUserDetailsChecked] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [lastPath, setLastPath] = useState('');
    const [navigationAttempts, setNavigationAttempts] = useState(0);

    useEffect(() => {
        if (!user) return;
        const tempHasAllDetails = Boolean(
            user.branch && 
            user.studyType && 
            user.gender && 
            user.role && 
            user.collegeName && 
            user.dob
        );
        setHasAllDetails(tempHasAllDetails);
        setIsUserDetailsChecked(true);
    }, [user]);

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthChecked) return;
            try {
                const response = await axios.get(config.apiBaseUrl + '/auth/verify', {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.data.isAuthenticated) {
                    dispatch(setAuth({
                        isAuthenticated: true,
                        isVerified: response.data.user?.isVerified,
                        user: null
                    }));

                    const userResult = await dispatch(fetchUser()).unwrap();
                    dispatch(setAuth({
                        isAuthenticated: true,
                        isVerified: response.data.user?.isVerified,
                        user: userResult
                    }));
                    // Fetch flashcard statuses after user info
                    dispatch(fetchFlashcardStatuses());
                } else {
                    dispatch(setAuth({
                        isAuthenticated: false,
                        isVerified: false,
                        user: null
                    }));
                    setHasAllDetails(false);
                    setIsUserDetailsChecked(true);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                dispatch(setAuth({
                    isAuthenticated: false,
                    isVerified: false,
                    user: null
                }));
                setHasAllDetails(false);
                setIsUserDetailsChecked(true);
            } finally {
                setIsAuthChecked(true);
            }
        };

        checkAuth();
    }, [dispatch]);

    // Navigation guard effect
    useEffect(() => {
        const handleNavigation = async () => {
            // Skip navigation if still checking auth
            if (!isAuthChecked) return;

            // Skip if we're already navigating or if the path hasn't changed
            if (isNavigating || lastPath === location.pathname) return;

            // Set navigating state to prevent multiple navigations
            setIsNavigating(true);

            try {
                // Only check auth for protected routes
                if (authentication) {
                    if (!isAuthenticated) {
                        navigate('/login', { replace: true });
                        return;
                    }

                    if (!isVerified) {
                        const verificationRoutes = ['/verificationDialogue', '/verify-otp'];
                        if (!verificationRoutes.includes(location.pathname)) {
                            navigate('/verificationDialogue', { replace: true });
                            return;
                        }
                    }

                    // Only redirect from complete-profile if user has completed profile
                    if (hasAllDetails && location.pathname === '/complete-profile') {
                        console.log("hi1")
                        navigate('/home', { replace: true });
                        return;
                    }
                } 
                // Handle public routes
                else {
                    const publicRoutes = ['/login', '/signup', '/landing'];
                    if (isAuthenticated && hasAllDetails && publicRoutes.includes(location.pathname)) {
                        console.log("hi2")
                        navigate('/home', { replace: true });
                        return;
                    }
                }

                // Update last path after successful navigation
                setLastPath(location.pathname);
            } finally {
                // Reset navigating state after a short delay to allow route transition
                setTimeout(() => {
                    setIsNavigating(false);
                }, 100);
            }
        };

        handleNavigation();
    }, [isAuthenticated, isVerified, hasAllDetails, isAuthChecked, location.pathname, authentication, navigate]);

    // Show loading spinner only when checking auth
    if (!isAuthChecked) {
        return <LoadingSpinner fullScreen />;
    }

    // Show profile completion dialog if user is authenticated and verified but hasn't completed profile
    if (authentication && isAuthenticated && isVerified && !hasAllDetails && location.pathname !== '/complete-profile') {
        return <ProfileCompletionDialog />;
    }

    return children || <Outlet />;
}

export default Protected;

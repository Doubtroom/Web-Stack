import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { fetchUser, setAuth } from '../store/authSlice.js';
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

    // Check user details completeness
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

    // Auth check effect
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

            // Prevent multiple navigations and unnecessary effect runs
            if (!isUserDetailsChecked || isNavigating || lastPath === location.pathname) return;

            // Reset navigation attempts if path changes
            if (lastPath !== location.pathname) {
                setNavigationAttempts(0);
            }

            // Prevent infinite navigation loops
            if (navigationAttempts >= 2) {
                console.warn('Navigation loop detected, stopping navigation');
                return;
            }

            setIsNavigating(true);
            setLastPath(location.pathname);
            setNavigationAttempts(prev => prev + 1);
            const currentPath = location.pathname;

            try {
                // Protected route access
                if (authentication) {          
                    if (!isAuthenticated) {
                        navigate('/login', { replace: true });
                        return;
                    }

                    if (!isVerified) {
                        const verificationRoutes = ['/verificationDialogue', '/verify-otp'];
                        if (!verificationRoutes.includes(currentPath)) {
                            navigate('/verificationDialogue', { replace: true });
                            return;
                        }
                    }

                    // Prevent access to complete-profile if user has already completed their profile
                    if (hasAllDetails && currentPath === '/complete-profile') {
                        navigate('/home', { replace: true });
                        return;
                    }
                } 
                // Public route access
                else {
                    // Redirect to home if authenticated and trying to access auth pages
                    const publicRoutes = ['/login', '/signup', '/landing'];
                    if (isAuthenticated && publicRoutes.includes(currentPath)) {
                        navigate('/home', { replace: true });
                        return;
                    }
                }
            } finally {
                setIsNavigating(false);
            }
        };

        handleNavigation();
    }, [isAuthenticated, isVerified, hasAllDetails, isAuthChecked, isUserDetailsChecked, location.pathname, authentication, navigate, lastPath, navigationAttempts]);

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

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchUser, setAuth } from '../store/authSlice.js';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner.jsx'

axios.defaults.withCredentials = true;

function Protected({ children, authentication = false}) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [authState, setAuthState] = useState({
        isLoading: true,
        isUserDataLoading: true,
        hasUserDetails: false,
        isCheckingProfile: true,
        step: 'initializing' // initializing -> checking -> fetching -> updating -> ready
    });
    
    // Get auth state from Redux
    const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated);
    const isVerified = useSelector((state) => state?.auth?.isVerified);
    const otpSent = useSelector((state) => state?.auth?.otpSent);
    const user = useSelector((state) => state?.auth?.user);

    // Check user details whenever user data changes
    useEffect(() => {
        if (!user) {
            setAuthState(prev => ({
                ...prev,
                hasUserDetails: false,
                isCheckingProfile: false,
                step: 'ready'
            }));
            return;
        }
        
        const hasAllDetails = Boolean(
            user.branch && 
            user.studyType && 
            user.gender && 
            user.role && 
            user.collegeName && 
            user.dob
        );
        
        setAuthState(prev => ({
            ...prev,
            hasUserDetails: hasAllDetails,
            isCheckingProfile: false,
            step: 'ready'
        }));
    }, [user]);

    // Handle authentication and user data fetching
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setAuthState(prev => ({ ...prev, step: 'checking' }));
                const response = await axios.get('https://doubtroom.onrender.com/api/auth/verify', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.isAuthenticated) {
                    setAuthState(prev => ({ ...prev, step: 'fetching' }));
                    const userResult = await dispatch(fetchUser()).unwrap();
                    
                    setAuthState(prev => ({ ...prev, step: 'updating' }));
                    await dispatch(setAuth({
                        isAuthenticated: true,
                        isVerified: response.data.user?.isVerified,
                        user: userResult
                    }));
                } else {
                    await dispatch(setAuth({
                        isAuthenticated: false,
                        isVerified: false
                    }));
                }
            } catch (error) {
                console.error("Auth check error:", error);
                await dispatch(setAuth({
                    isAuthenticated: false,
                    isVerified: false
                }));
            } finally {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    isUserDataLoading: false,
                    step: 'ready'
                }));
            }
        };

        checkAuth();
    }, [dispatch]);

    // Handle navigation
    useEffect(() => {
        if (authState.step !== 'ready') return;

        const currentPath = location.pathname;

        // Handle public routes
        if (!authentication) {
            if (isAuthenticated) {
                navigate('/home', { replace: true });
            }
            return;
        }

        // Handle protected routes
        if (authentication && !isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }

        // Handle verification flow
        if (authentication && isAuthenticated && !isVerified) {
            const verificationRoutes = ['/verificationDialogue', '/verify-otp'];
            if (!verificationRoutes.includes(currentPath)) {
                navigate('/verificationDialogue', { replace: true });
            }
            if (currentPath === '/verify-otp' && !otpSent) {
                navigate('/verificationDialogue', { replace: true });
            }
            return;
        }

        // Handle profile completion flow
        if (authentication && isAuthenticated && isVerified) {
            if (!authState.hasUserDetails && currentPath !== '/complete-profile') {
                navigate('/complete-profile', { replace: true });
            } else if (authState.hasUserDetails && currentPath === '/complete-profile') {
                navigate('/home', { replace: true });
            }
        }
    }, [isAuthenticated, isVerified, authentication, location.pathname, navigate, authState]);

    // Show loading state while any loading is in progress
    if (authState.step !== 'ready') {
        return <LoadingSpinner fullScreen />;
    }

    if (authentication === null) {
        return typeof children === 'function' ? children({ isAuthenticated }) : children;
    }

    return children;
}

export default Protected;

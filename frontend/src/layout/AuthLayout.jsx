import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

function Protected({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get auth state from Redux
    const reduxAuthStatus = useSelector((state) => state?.auth?.status || false);
    const profileCompleted = useSelector((state) => state?.auth?.profileCompleted || false);

    // Only use localStorage as a secondary check if Redux state is true
    const authStatus = reduxAuthStatus || localStorage.getItem('authStatus') === 'true';
    const localProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
    const fromSignup = localStorage.getItem("fromSignup") === "true";

    useEffect(() => {
        // If user is not authenticated and tries to access protected pages
        if (!authStatus && authentication) {
            navigate('/login', { replace: true });
            return;
        }

        // If user is authenticated and tries to access login/signup pages
        if (authStatus && !authentication) {
            navigate('/home', { replace: true });
            return;
        }

        // If user is authenticated but profile is not completed
        if (authStatus && !profileCompleted && !localProfileCompleted) {
            // If user came from signup, they must complete their profile first
            if (fromSignup && location.pathname !== '/complete-profile') {
                navigate('/complete-profile', { replace: true });
                return;
            }
            // For other users, allow access to complete-profile
            if (location.pathname !== '/complete-profile') {
                navigate('/complete-profile', { replace: true });
                return;
            }
        }

        // If user is authenticated and profile is completed, prevent access to complete-profile
        if (authStatus && (profileCompleted || localProfileCompleted) && location.pathname === '/complete-profile') {
            navigate('/home', { replace: true });
        }
    }, [authStatus, profileCompleted, authentication, location, navigate, fromSignup]);

    return <>{children}</>;
}

export default Protected;

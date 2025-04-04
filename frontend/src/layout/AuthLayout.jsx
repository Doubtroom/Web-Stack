import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

function Protected({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get auth state from Redux
    const reduxAuthStatus = useSelector((state) => state?.auth?.status || false);
    const profileCompleted = useSelector((state) => state?.auth?.profileCompleted || false);

    // Only use localStorage as a secondary check if Redux state is false
    const authStatus = reduxAuthStatus || localStorage.getItem('authStatus') === 'true';
    const localProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
    const fromSignup = localStorage.getItem("fromSignup") === "true";

    useEffect(() => {
        // Special handling for root path
        if (location.pathname === '/') {
            if (authStatus) {
                navigate('/home', { replace: true });
            } else {
                navigate('/landing', { replace: true });
            }
            return;
        }

        // Handle public routes (login, signup, landing)
        if (!authentication) {
            if (authStatus) {
                navigate('/home', { replace: true });
                return;
            }
            return; // Allow access to public routes for non-authenticated users
        }

        // Handle protected routes
        if (authentication) {
            if (!authStatus) {
                navigate('/login', { replace: true });
                return;
            }

            // Handle profile completion
            if (!profileCompleted && !localProfileCompleted) {
                if (fromSignup && location.pathname !== '/complete-profile') {
                    navigate('/complete-profile', { replace: true });
                    return;
                }
                if (location.pathname !== '/complete-profile') {
                    navigate('/complete-profile', { replace: true });
                    return;
                }
            }

            // Prevent accessing complete-profile if profile is already completed
            if ((profileCompleted || localProfileCompleted) && location.pathname === '/complete-profile') {
                navigate('/home', { replace: true });
                return;
            }
        }
    }, [authStatus, profileCompleted, authentication, location, navigate, fromSignup, localProfileCompleted]);

    // For root path conditional rendering
    if (authentication === null) {
        return typeof children === 'function' ? children({ authStatus }) : children;
    }

    return <>{children}</>;
}

export default Protected;

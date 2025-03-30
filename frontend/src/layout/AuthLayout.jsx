import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'

function Protected({children, authentication=true}) {
    const reduxAuthStatus = useSelector((state)=>state.auth.status)
    const navigate = useNavigate()
    const location = useLocation()

    // Get auth status from localStorage
    const localAuthStatus = localStorage.getItem("authStatus") === "true"
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    const needsProfileCompletion = localStorage.getItem("needsProfileCompletion") === "true"
    
    // Check if all required fields are present
    const isProfileComplete = userData.role && 
                            userData.collegeName && 
                            userData.branch && 
                            userData.studyType && 
                            userData.phone && 
                            userData.gender

    const isAuthenticated = localAuthStatus || reduxAuthStatus

    useEffect(() => {
        // Get navigation state
        const state = window.history.state?.usr || {}
        const { fromLogout } = state

        // Handle navigation based on auth state
        if (authentication) {
            // Protected routes
            if (!isAuthenticated) {
                // Not logged in - redirect to landing
                localStorage.setItem("redirectPath", location.pathname)
                navigate('/landing', { replace: true })
            } else if (needsProfileCompletion && location.pathname !== '/complete-profile') {
                // If profile needs completion and not on complete-profile page, redirect
                navigate('/complete-profile', { replace: true })
            }
        } else {
            // Public routes
            if (isAuthenticated) {
                if (needsProfileCompletion) {
                    // If profile needs completion, go to complete-profile
                    navigate('/complete-profile', { replace: true })
                } else if (!fromLogout) {
                    // If profile is complete and not from logout, go to home
                    navigate('/home', { replace: true })
                }
            }
        }
    }, [isAuthenticated, needsProfileCompletion, authentication, navigate, location.pathname])

    // For protected routes
    if (authentication) {
        if (!isAuthenticated) return null
        // Block rendering if profile needs completion
        if (needsProfileCompletion && location.pathname !== '/complete-profile') return null
        return <>{children}</>
    }

    // For public routes
    // Block rendering if authenticated and profile is complete
    if (isAuthenticated && !needsProfileCompletion) return null
    return !isAuthenticated ? <>{children}</> : null
}

export default Protected
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import User from "../models/User.js"

export const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ 
            message: "Authentication required. Please log in to continue.",
            isAuthenticated: false
        });
    }

    try {
        if (accessToken) {
            // Verify access token
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            
            // Check if user is verified
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    isAuthenticated: false
                });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    message: "Please verify your email before accessing this resource",
                    isAuthenticated: true,
                    isVerified: false
                });
            }

            req.user = {
                id: decoded.id,
                email: decoded.email
            };
            next();
        } else if (refreshToken) {
            // Access token expired, try to refresh
            try {
                // Verify refresh token
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                
                // Find user and check if refresh token matches
                const user = await User.findById(decoded.id);

                if (!user || !user.refreshToken) {
                    return res.status(401).json({ 
                        message: "Your session has expired. Please log in again.",
                        isAuthenticated: false,
                    });
                }

                // Check if user is verified
                if (!user.isVerified) {
                    return res.status(403).json({
                        message: "Please verify your email before accessing this resource",
                        isAuthenticated: true,
                        isVerified: false
                    });
                }

                // Compare the refresh token with the stored encrypted token
                const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
                if (!isRefreshTokenValid) {
                    return res.status(401).json({ 
                        message: "Your session has expired. Please log in again.",
                        isAuthenticated: false,
                    });
                }

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "10m" }
                );

                // Set new access token
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
                    maxAge: 10 * 60 * 1000
                });

                req.user = {
                    id: user._id,
                    email: user.email
                };
                next();
            } catch (refreshError) {
                return res.status(401).json({ 
                    message: "Your session has expired. Please log in again.",
                    isAuthenticated: false,
                    err: refreshError
                });
            }
        }
    } catch (error) {
        return res.status(401).json({ 
            message: "Authentication failed. Please log in again.",
            isAuthenticated: false
        });
    }
};

export const verifyAuthentication=async (req,res,next)=>{
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ 
            message: "Authentication required. Please log in to continue.",
            isAuthenticated: false
        });
    }

    try {
        if (accessToken) {
            // Verify access token
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            
            // Check if user is verified
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    isAuthenticated: false
                });
            }


            req.user = {
                id: decoded.id,
                email: decoded.email
            };
            next();
        } else if (refreshToken) {
            // Access token expired, try to refresh
            try {
                // Verify refresh token
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                
                // Find user and check if refresh token matches
                const user = await User.findById(decoded.id);

                if (!user || !user.refreshToken) {
                    return res.status(401).json({ 
                        message: "Your session has expired. Please log in again.",
                        isAuthenticated: false,
                    });
                }


                // Compare the refresh token with the stored encrypted token
                const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
                if (!isRefreshTokenValid) {
                    return res.status(401).json({ 
                        message: "Your session has expired. Please log in again.",
                        isAuthenticated: false,
                    });
                }

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "10m" }
                );

                // Set new access token
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
                    maxAge: 10 * 60 * 1000
                });

                req.user = {
                    id: user._id,
                    email: user.email
                };
                next();
            } catch (refreshError) {
                return res.status(401).json({ 
                    message: "Your session has expired. Please log in again.",
                    isAuthenticated: false,
                    err: refreshError
                });
            }
        }
    } catch (error) {
        return res.status(401).json({ 
            message: "Authentication failed. Please log in again.",
            isAuthenticated: false
        });
    }
}

export const handleLogout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken

        // Clear refresh token from user document if refresh token exists
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
                const user = await User.findById(decoded.id)
                if (user) {
                    user.refreshToken = null
                    await user.save()
                }
            } catch (error) {
                // If refresh token is invalid, just proceed with clearing cookies
                console.log("Invalid refresh token during logout")
            }
        }

        // Clear cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax'
        })
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax'
        })

        // Set isAuthenticated to false in response
        res.locals.isAuthenticated = false
        next()
    } catch (error) {
        console.error("Logout middleware error:", error)
        res.status(500).json({ message: "Logout failed" })
    }
}
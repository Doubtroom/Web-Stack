import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const signup=async(req,res)=>{
    const {email,password,displayName}=req.body

    try {
        const existing=await User.findOne({email})
        if(existing) return res.status(400).json({message:"User already exists"})
        
        const hashed=await bcrypt.hash(password,12)

        const user = await User.create({
            email,
            password: hashed,
            displayName,    
            isVerified: false,
            passwordRecoveryDone: true // Explicitly set this field
        })

        const refreshToken = jwt.sign(
            {id: user._id}, // Use actual user ID
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: "24h"} // Match with cookie expiry
        )

        const encryptedRefreshToken = await bcrypt.hash(refreshToken, 12)

        user.refreshToken = encryptedRefreshToken
        await user.save()

        const accessToken = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "10m"}
        )

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 10 * 60 * 1000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })

        res.status(201).json({
            message: "User created successfully",
            user: {
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
                isVerified: user.isVerified
            }
        })

    } catch (error) {
        console.error("Signup error:", error)
        // Send more detailed error message
        res.status(500).json({
            message: "Signup failed",
            error: error.message || "Unknown error occurred"
        })
    }
}

export const login=async(req,res)=>{
    const {email,password}=req.body

    try {
        const existingAccessToken = req.cookies.accessToken
        const existingRefreshToken = req.cookies.refreshToken

        if (existingAccessToken || existingRefreshToken) {
            try {
                const decoded = jwt.verify(existingAccessToken, process.env.JWT_SECRET)
                return res.status(400).json({
                    message: "You are already logged in. Please logout first to login with a different account.",
                    isAuthenticated: true
                })
                
            } catch (error) {
                if (existingRefreshToken) {
                    try {
                        const decoded = jwt.verify(existingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
                        return res.status(400).json({
                            message: "You are already logged in. Please logout first to login with a different account.",
                            isAuthenticated: true
                        })
                    } catch (refreshError) {
                    }
                }
            }
        }

        const user=await User.findOne({email})
        if(!user) return res.status(400).json({message:"User not found"})
        
        const match=await bcrypt.compare(password,user.password)
        if(!match) return res.status(400).json({message:"Invalid password"})

        const accessToken = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "10m"}
        )

        if(!user.isVerified) {
            const refreshToken = jwt.sign(
                {id: user._id},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: "24h"}
            )

            const encryptedRefreshToken = await bcrypt.hash(refreshToken, 12)
            user.refreshToken = encryptedRefreshToken
            await user.save()

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
                maxAge: 10 * 60 * 1000 
            })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
                maxAge: 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                message: "User not verified",
                isAuthenticated: true,
                user: {
                    userId: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    isVerified: user.isVerified
                }
            })
        }

        // For verified users
        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: "30d"}
        )

        const encryptedRefreshToken = await bcrypt.hash(refreshToken, 12)
        user.refreshToken = encryptedRefreshToken
        await user.save()

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 10 * 60 * 1000 
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        res.json({
            message: "Login successful",
            isAuthenticated: true,
            user: {
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
                isVerified: user.isVerified
            }
        })

    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({message:"Login failed"})
    }
}

export const saveUserProfile=async(req,res)=>{
    const userId = req.user.id;

    const {collegeName,branch,studyType,phone,gender,role,dob,features}=req.body

    if(!userId)return res.status(400).json({message:"User not authenticated"})

    try {
        const user=await User.findById(userId)

        if(!user) return res.status(400).json({message:"User not found"})
        if(!(user.isVerified))return res.status(401).json({message:"User not verified"})

        user.collegeName=collegeName
        user.branch=branch
        user.studyType=studyType
        user.phone=phone?phone:null
        user.gender=gender
        user.role=role
        user.dob=dob
        if (features) user.features = features;

        await user.save()
        
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                email: user.email,
                displayName: user.displayName,
                collegeName: user.collegeName,
                branch: user.branch,
                studyType: user.studyType,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                dob: user.dob,
                features: user.features
            }
        })
        
    } catch (error) {
        console.error("Profile update error:", error)
        res.status(500).json({message:"Saving User Profile failed"})
    }
}

export const getAllUsers = async (req, res) => {    
    try {
        const users = await User.find({}, {
            password: 0,
            otp: 0,     
            resetToken: 0,
            resetExpires: 0
        });
        
        res.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export const logout = async (req, res) => {
    try {
        res.json({ 
            message: "Logged out successfully",
            isAuthenticated: false
        })
    } catch (error) {
        console.error("Logout error:", error)
        res.status(500).json({ message: "Logout failed" })
    }
}

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                email,
                displayName: name,
                profilePicture: picture,
                isVerified: true, // Google accounts are pre-verified
                password: await bcrypt.hash(Math.random().toString(36), 12) // Random password for Google users
            });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
        );

        const encryptedRefreshToken = await bcrypt.hash(refreshToken, 12);
        user.refreshToken = encryptedRefreshToken;
        await user.save();

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 10 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Google login successful",
            isAuthenticated: true,
            user: {
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Google login failed" });
    }
} 

// backend/controllers/authController.js
export const getUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log('User from database:', user); // Debug log

        // If user has firebaseId, it's a Firebase account, otherwise it's a MongoDB account
        const isFirebaseUser = !!user.firebaseId;

        res.json({
            user: {
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
                collegeName: user.collegeName,
                branch: user.branch,
                studyType: user.studyType,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                isVerified: user.isVerified,
                dob: user.dob,
                features: user.features,
                firebaseId: isFirebaseUser ? user.firebaseId : null,
                authType: isFirebaseUser ? 'firebase' : 'mongodb'
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Failed to get user data" });
    }
};


export const authStatus=async (req,res)=>{
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
            // Send response with user details and verification status
            return res.status(200).json({
                isAuthenticated: true,
                user: {
                    id: user._id,
                    email: user.email,
                    isVerified: user.isVerified
                }
            });
        } else if (refreshToken) {
            // Access token expired, try to refresh
            try {
                // Verify refresh token
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                console.log('Decoded token:', decoded);
                
                // Find user and check if refresh token matches
                const user = await User.findById(decoded.id);
                console.log('User lookup result:', user);


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

                // Send response with user details and verification status
                return res.status(200).json({
                    isAuthenticated: true,
                    user: {
                        id: user._id,
                        email: user.email,
                        isVerified: user.isVerified
                    }
                })
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

export const updateFeatures = async (req, res) => {
    const userId = req.user.id;
    const { features } = req.body;
    if (!userId) return res.status(400).json({ message: 'User not authenticated' });
    if (!features || typeof features !== 'object') return res.status(400).json({ message: 'Invalid features object' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.features = features;
        await user.save();
        res.status(200).json({ message: 'Features updated successfully', features: user.features });
    } catch (error) {
        console.error('Error updating features:', error);
        res.status(500).json({ message: 'Failed to update features' });
    }
};
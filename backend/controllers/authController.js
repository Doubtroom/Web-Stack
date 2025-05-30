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
            isVerified: false
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
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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
        res.status(500).json({message: "Signup failed"})
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
                        // If both tokens are invalid, proceed with login
                    }
                }
            }
        }

        const user=await User.findOne({email})
        if(!user) return res.status(400).json({message:"User not found"})
        
        if(!user.isVerified)return res.status(401).json({message:"User not verified"})
        const match=await bcrypt.compare(password,user.password)
        if(!match) return res.status(400).json({message:"Invalid password"})

        const accessToken = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "10m"}
        )

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
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000 
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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

    const {collegeName,branch,studyType,phone,gender,role,dob}=req.body

    if(!userId)return res.status(400).json({message:"User not authenticated"})

    try {
        const user=await User.findById(userId)

        if(!user) return res.status(400).json({message:"User not found"})
        if(!(user.isVerified))return res.status(401).json({message:"User not verified"})

        if(user.collegeName || user.branch || user.studyType || user.phone || user.gender || user.role || user.dob) {
            return res.status(400).json({
                message: "Profile already exists. Profile can only be saved once.",
                user: {
                    email: user.email,
                    displayName: user.displayName,
                    collegeName: user.collegeName,
                    branch: user.branch,
                    studyType: user.studyType,
                    phone: user.phone,
                    gender: user.gender,
                    role: user.role,
                    dob: user.dob
                }
            })
        }

        user.collegeName=collegeName
        user.branch=branch
        user.studyType=studyType
        user.phone=phone?phone:null
        user.gender=gender
        user.role=role
        user.dob=dob

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
                dob: user.dob
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
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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

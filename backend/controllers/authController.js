import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

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

        const token = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
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
        const user=await User.findOne({email})
        if(!user) return res.status(400).json({message:"User not found"})
        
        if(!user.isVerified)return res.status(401).json({message:"User not verified"})
        const match=await bcrypt.compare(password,user.password)
        if(!match) return res.status(400).json({message:"Invalid password"})

        const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"1d"})

        res.json({token,user})

    } catch (error) {
        res.status(500).json({message:"Login failed"})
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            password: 0,  // Exclude password from results
            otp: 0,      // Exclude OTP data
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

import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authRoutes.js"
import dataRoutes from "./routes/dataRoutes.js"

dotenv.config()
const app=express()

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, 'https://localhost:3001', 'https://doubtroom.onrender.com','https://doubtroom-git-feat-mongodb-lols-projects-664137cb.vercel.app'],
    credentials: true,  // This is important for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))

app.use(express.json())
app.use(cookieParser())  // Add cookie-parser middleware

// Routes
app.use('/api/auth',authRoutes)
app.use('/api/data',dataRoutes)

mongoose.connect(process.env.MONGO_URI,{
  dbName: "org-db"
})
.then(()=>{
  app.listen(process.env.PORT || 5000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 5000}`)
  })
})
.catch((err)=>{
  console.log(err)
})

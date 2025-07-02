import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authRoutes.js"
import dataRoutes from "./routes/dataRoutes.js"
import formDataRoutes from "./routes/formDataRoutes.js"
import { limiter, authLimiter, internalLimiter } from "./middleware/rateLimiterMiddleware.js"

dotenv.config()
const app=express()

// Remove global rate limiter
// app.use(limiter);

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, 'https://localhost:3001'],
    credentials: true,  // This is important for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))

app.use(express.json())
app.use(cookieParser())  // Add cookie-parser middleware

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/data', internalLimiter, dataRoutes)
app.use('/api/form-data', limiter, formDataRoutes)

mongoose.connect(process.env.MONGO_URI,{
  dbName: "org-db"
})
.then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log(err)
})

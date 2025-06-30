import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authRoutes.js"
import dataRoutes from "./routes/dataRoutes.js"
import formDataRoutes from "./routes/formDataRoutes.js"
import { limiter } from "./middleware/rateLimiterMiddleware.js"

dotenv.config()
const app=express()

// Apply rate limiting to all routes
app.use(limiter);

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

// Routes
app.use('/api/auth',authRoutes)
app.use('/api/data',dataRoutes)
app.use('/api/form-data', formDataRoutes)

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

import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/authRoutes.js"
import dataRoutes from "./routes/dataRoutes.js"

dotenv.config()
const app=express()

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Specific rate limiter for upvote operations (more restrictive)
const upvoteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 upvotes per minute
  message: {
    error: 'Too many upvote requests, please slow down.',
    retryAfter: '1 minute'
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for non-upvote operations
    return !req.path.includes('/upvote');
  }
});

// Apply rate limiting to all routes
app.use(limiter);

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

// Apply upvote-specific rate limiting to data routes
app.use('/api/data', upvoteLimiter);

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

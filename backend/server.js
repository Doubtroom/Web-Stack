import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/auth.js"

dotenv.config()
const app=express()
app.use(cors())
app.use(express.json())
app.use('/api/auth',authRoutes)

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  app.listen(process.env.PORT || 5000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 5000}`)
  })
})
.catch((err)=>{
  console.log(err)
})

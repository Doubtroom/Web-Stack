import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    displayName:{type:String,required:true},
    photoURL:{type:String},
    isVerified:{type:Boolean,default:false},
    otp:{
        code:{type:String},
        expiresAt:{type:Date}
    },
    resetToken:{type:String},
    resetExpires:{type:Date},
    provider:{type:String,default:"email"},
})

export default mongoose.model('User',userSchema)
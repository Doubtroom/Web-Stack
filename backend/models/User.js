import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    firebaseId: { type: String, default: null },
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    displayName:{type:String,required:true},
    photoURL:{type:String, default: null},
    photoId:{type:String, default: null},
    isVerified:{type:Boolean,default:false},
    branch: {type:String, default: null},
    studyType: {type:String, default: null},
    phone: {type:String, default: null},
    gender: {type:String, default: null},
    role: {type:String, default: null},
    collegeName: {type:String, default: null},
    dob: {type:String, default: null},
    refreshToken: {type: String, default: null},
    createdAt: {
      type: Date,
      default: Date.now
    },
    otp:{
        code:{type:String, default: null},
        expiresAt:{type:Date, default: null}
    },
    resetToken:{type:String, default: null},
    resetExpires:{type:Date, default: null},
    provider:{type:String,default:"email"},
    passwordRecoveryDone: {type: Boolean, default: false}
})

// Add a pre-save middleware to ensure passwordRecoveryDone exists
userSchema.pre('save', function(next) {
    if (this.isModified('password') && this.firebaseId && !this.passwordRecoveryDone) {
        this.passwordRecoveryDone = true;
    }
    next();
});

export default mongoose.model('User',userSchema)
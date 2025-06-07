import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    firebaseId: { type: String },
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    displayName:{type:String,required:true},
    photoURL:{type:String},
    photoId:{type:String},
    isVerified:{type:Boolean,default:false},
    branch: {type:String},
    studyType: {type:String},
    phone: {type:String},
    gender: {type:String},
    role: {type:String},
    collegeName: {type:String},
    dob: {type:String},
    refreshToken: {type: String},
    createdAt: {
      type: Date,
      default: Date.now
    },
    otp:{
        code:{type:String},
        expiresAt:{type:Date}
    },
    resetToken:{type:String},
    resetExpires:{type:Date},
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
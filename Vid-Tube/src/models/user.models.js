import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique:true,
            lowercase:true,
            trim: true,
            index:true 
        },
        email:{
            type: String,
            required: true,
            unique:true,
            lowercase:true,
            trim: true,
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index : true
        },
        avatar:{
            type: String,// cloudinary url
            required: true,
        },
        coverImage:{
            type: String,// cloudinary url
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type:String,
            required: [true, "password is required"]
        },
        refreshToken:{
            type:String,
        }
    },
    {timestamps : true}
)


userSchema.pre('save', async function (next) {
    // Only hash the password if it is being modified or is new
    if (!this.isModified('password')) return next();

    // Hash the password with a cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});


// Method to compare the input password with the stored hashed password
userSchema.methods.isPasswordCorrect = async function (inputPassword) {
    try {
        // Compare the plain text password with the hashed password
        const isMatch = await bcrypt.compare(inputPassword, this.password);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false; // Return false if an error occurs
    }
};


userSchema.methods.generateAccessToken = function (){
    // short lived access token 
    
  return  jwt.sign({ 
        _id : this._id ,
        email: this.email,
        username : this.username,
        fullname : this.fullname
    }, process.env.ACCESS_TOKEN_SECRET,
{expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function (){
    // long lived refresh token 
  return  jwt.sign({ 
        _id : this._id ,  
    },
     process.env.REFRESH_TOKEN_SECRET,
{expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}

export const User = mongoose.model("User", userSchema)

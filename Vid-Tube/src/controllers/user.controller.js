import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config() //  need to mention



const generateAccessAndRefreshToken = async (userId) =>{
   
    
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // todo:: accept data from user
    let { fullname, username, email,  password } = req.body

    // validation 
    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required ");
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existUser) {
        throw new ApiError(409, "User with with email or username is already exists");
    }

    console.warn(req.files); // whether the multer was working properly or not 
    
    // console.log("req.files?.avatar[0]?.:",req.files?.avatar[0].path);
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is missing ");
    }

    if (!coverLocalPath) {
        throw new ApiError(400, "CoverImage files is missing ");
    }

    let avatar ;
    try {
       avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("uploaded Avatar ::", avatar );
        
    } catch (error) {
        console.log("Error uploading Avatar ::", error);
        throw new ApiError(500, "Failed to upload Avatar ");  
    }

    let coverImage ;
    try {
      coverImage =  await uploadOnCloudinary(coverLocalPath)
        console.log("uploaded coverImage :: ",coverImage );
        
    } catch (error) {
        console.log("Error uploading coverImage ::", error);
        throw new ApiError(500, "Failed to upload coverImage ");
    }

   try {

     const user = await User.create({
         fullname,
         avatar: avatar.url,
         coverImage: coverImage?.url || "",
         email,
         password,
         username: username.toLowerCase()
     })
 
     const createdUser = await User.findById(user._id).select("-password -refreshToken")
 
     if (!createdUser) {
         throw new ApiError(400, "Something went wrong while creating user");
     }
         return res
             .status(201)
             .json(new ApiResponse(200, createdUser, "user registered successfully"))

   } catch (error) {
        
    console.log("User Creation Failed");
    if(avatar){
        
        await deleteFromCloudinary(avatar.public_id)
        console.log(avatar.public_id);
    }
    if(coverImage){
        await deleteFromCloudinary(coverImage.public_id)
        console.log(coverImage.public_id);
        
    }
    throw new ApiError(400, "Something went wrong while creating user and images were deleted  ");
    
   }
});

// const loginUser = asyncHandler(async (req,res) => {
//     // get a data from a body
//     const {email, username, password} = req.body
//     // validation 
//     if(!email){
//         throw new ApiError(400, "Email is required ")
//     }

//     const user = await User.findOne({
//         $or : [{username}, {email}]
//     })
//     if(!user) {
//         throw new ApiError(404, "User not found ")
//     }
//     // validate password 
//     const isPasswordValid = await user.isPasswordCorrect(password)
//     if(!isPasswordValid){
//         throw new ApiError(401, "Invalid credentials")
//     }

//     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     if(!loggedInUser){
//         throw new ApiError(401, "User Not Found ")
//     }

//     const options = {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//     }
//     return res.status(200)
//     .cookie("accessToken",accessToken,options)
//     .cookie("refreshToken", refreshToken,options)
//     .json(new ApiResponse(200, 
//         {user: loggedInUser, accessToken, refreshToken },
//         "User Logged In successfully."
//     ))

// });


const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);
    console.log(username);
    console.log(password);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
    console.log(isPasswordValid);

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

});// did 


const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(

        //TODO :: need to back after middleware

        req.user._id, 
        {
            $set : {
                refreshToken : undefined,
            }
        },
        {new:true}
    )

    // release the cookie 

    const options = {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User Logged out successfully "))

});

//////////////////////////////////

const refreshAccessToken = asyncHandler(async (req,res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    // console.log(incomingRefreshToken);
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is required")
    }

    try {
      let decodedToken =   jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        // console.log("decoded Token",decodedToken);
        
       let user =  await User.findById(decodedToken?._id)
        
       console.log("user._id :: ",user._id);

       if(!user) {
           throw new ApiError(401, "Invalid Refresh Token")
        }
        // console.log("user.refreshToken :: ",user?.refreshToken); //resolved

       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token Expired ")
       }

       const options = 
       {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        }

 const {accessToken, refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            { accessToken,
                refreshToken :  newRefreshToken
            },
            "Access token refreshed successfully"
        ));


    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token ")
    }
});



const changeCurrentPassword = asyncHandler(async (req, res) =>{
    // grab older password 
    const {oldPassword, newPassword} = req.body
    //find and grab the user
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    console.log("username:",user.username);

    
if(!isPasswordValid) {
        throw new ApiError(401, "Old Password is incorrect ")
    }
    user.password = newPassword ;

    await user.save({ validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully "))
});// password changed 


const getCurrentUser = asyncHandler(async (req, res) =>{ 
    return res.status(200).json(new ApiResponse(200, req.user, "Current user details "))
}); // worked  properly


const updateAccountDetails = asyncHandler(async (req, res) =>{
    const {fullname, email, password} = req.body
    console.log("fullname:", fullname);
    console.log("email :'", email);
    
    if( !email){
        throw new  ApiError(400, "Fullname and email are required ")
    }
   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email:email,
                password:password
            }
        },
        {new:true}
    ).select("-password -refreshToken")


    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
 }); // use body data [raw] :: 



const updateUserAvatar = asyncHandler(async (req, res) =>{ 
    // access local  avatar file path
   
    const avatarLocalPath = req.file?.path
    // console.log("body :", req.file);
    
    
    if(!avatarLocalPath) {
        throw new ApiError(400, "AVATAR file is required")
    }
    // grab images 
   const avatar =  await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url) {
    throw new ApiError(600, "Something went wrong while uploading avatar ")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar : avatar.url 
        }
    },
    {new: true}
   ).select("-password -refreshToken")

   res.status(200).json(new ApiResponse(200, user, "Avatar updated Successfully "))
}); //worked properly


const updateUserCoverImage = asyncHandler(async (req, res) =>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400, " CoverImage file is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
    throw new ApiError(600, "Something went wrong while uploading cover image ")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage : coverImage.url 
            }
        },
        {new: true}
       ).select("-password -refreshToken")
    
       res.status(200).json(new ApiResponse(200, user, "Cover Image updated Successfully "))
 });  
 // worked 

// learn aggregation pipeline is important 
const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber" ] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
}) // worked properly

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField: "watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as :"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1,
                                }
                            }
                        ]

                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory,"watch history fetched successfully"))
})  // worked properly 


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};

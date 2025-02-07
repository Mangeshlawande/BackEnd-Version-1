import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";

// user <---> middleware <--> controller
/**
 * business logic 
 * 1. grab the token 
 * 2. decoded that  
 * 3. find out the user with that 
 * 4. updated with token

    authorization bearer token 
    special name given to the header where the access token come up with 
   1.  automatic key 
   Authorization  :: Bearer abcdefg


 */ 

// export const verifyJWT = asyncHandler(async(req, _, next) => {
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
//         // request  header express
        
//         // console.log(token);
//         if (!token) {
//             throw new ApiError(401, "Unauthorized request")
//         }
//     // decode the token 
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
//         if (!user) {    
//             throw new ApiError(401, "Invalid Access Token")
//         }
    
//         req.user = user;
//         next()
//         // next () --> transfer the control from one middleware to another middleware or to the final routes 
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid access token")
//     }
    
// })

// import jwt from 'jsonwebtoken';
// import asyncHandler from '../utils/asyncHandler';
// import ApiError from '../utils/ApiError';
// import User from '../models/User';



export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Get the token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // Check if token exists;

        if (!token) {
            throw new ApiError(401, "Unauthorized request: Access token is missing");
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the token payload;

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // Check if user exists

        if (!user) {

            throw new ApiError(401, "Unauthorized request: Invalid Access Token");
            
        }

        // Attach user object to request

        req.user = user;

        // Pass control to the next middleware or route handler

        next();

    } catch (error) {

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {

            throw new ApiError(401, error.message || "Invalid or expired access token");

        } else {

            throw new ApiError(500, "Internal Server Error during JWT verification");
        }
    }
});


/**
 * User <--> Middleware  <--> Controller
 * access <--> req.user   <--> (req, res)_id
 * 
 */
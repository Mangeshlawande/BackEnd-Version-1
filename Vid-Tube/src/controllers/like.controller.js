import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user.id; //assumes user contain authenticated user 

   try {
     if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid video ID");
     }
 
     //check if the like already exist 
    const existingLike =  await Like.findOne({video:videoId, likedby:userId });

     if(existingLike){
        //If exist , remove the like (unlike);
        await existingLike.deleteOne();

        return res.status(200).json(new ApiResponse(200, "Video unliked successfully"));
     }else{
         // Otherwise, create a new like
         await Like.create({ video: videoId, likedBy: userId });

         return res.status(201).json(new ApiResponse(201, "Video liked successfully"));
     }

   } catch (error) {
    throw new ApiError(500, "Something went wrong while toggling like ", error);
   }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user.id;

    try {

         // Check if the like already exists
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // If exists, remove the like (unlike)
        await existingLike.deleteOne();

        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully"));
    } else {

        // Otherwise, create a new like
        await Like.create({ comment: commentId, likedBy: userId });

        return res.status(201).json(new ApiResponse(201, "Comment liked successfully"));
    }

    } catch (error) {
        throw new ApiError(500, "Something went wromg while toggling like on comment!!", error);
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user.id;

    try {
        
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID");
        }
    
        // Check if the like already exists
        const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });
    
        if (existingLike) {
            // If exists, remove the like (unlike)
            await existingLike.deleteOne();
            return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully"));
        } else {
            // Otherwise, create a new like
            await Like.create({ tweet: tweetId, likedBy: userId });
            return res.status(201).json(new ApiResponse(201, "Tweet liked successfully"));
        }

    } catch (error) {
        throw new ApiError(501, "Something went wromg while toggling a Tweet!!", error)
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user.id;

try {
     // Find all likes associated with the user for videos
     const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } })
     .populate("video") // Populate the video details
     .exec();

 return res.status(200).json(new ApiResponse(200, "Liked videos retrieved successfully", likedVideos));
} catch (error) {
    throw new ApiError(502, "Something Went wrong while getting video !", error);
}
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};

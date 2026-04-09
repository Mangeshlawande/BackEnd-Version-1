import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary";

import {uploadOnCloudinary , deleteFromCloudinary} from "../utils/cloudinary.js"

// // Cloudinary configuration (replace with your credentials)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



const publishAVideo = asyncHandler(async (req, res) => {
  
        const { title, description } = req.body;
        // console.log("video[0]:",req.files.video[0]);
    // check whether the user is authenticated or not 
        if (!req.user || !isValidObjectId(req.user._id)) {
            throw new ApiError(400, "Invalid or missing user");
        }

        // Validate uploaded files
        if (!req.files ) {
            return res.status(400).json({
                success: false,
                message: "Video file is required.",
            });
        }

        if (!req.files.thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Thumbnail file is required.",
            });
        }

        const videoLocalPath = req.files?.video[0]?.path
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "video file is missing ");
    }

    let video ;
    try {
       video = await uploadOnCloudinary(videoLocalPath);
        console.log("uploaded Avatar ::", video );
        
    } catch (error) {
        console.log("Error uploading video ::", error);
        throw new ApiError(500, "Failed to upload video ");  
    }

    let thumbnail ;
    try {
      thumbnail =  await uploadOnCloudinary(thumbnailLocalPath)
        console.log("uploaded thumbnail :: ",thumbnail );

    } catch (error) {
        console.log("Error uploading thumbnail ::", error);
        throw new ApiError(500, "Failed to upload thumbnail ");
    }

   try {
     const newVideo = await Video.create({
         title,
         description,
         duration: video.duration,
         video: video.url, // Save video URL
        thumbnail: thumbnail.url || "", // Save thumbnail URL
        owner: req.user._id, // Assuming JWT is being used for user authentication
     });
 
     const createdVideo = await User.findById(newVideo._id).select("-description -duration")
 
     if (!createdVideo) {
         throw new ApiError(400, "Something went wrong while creating user ");
     }
 
         return res
             .status(201)
             .json(new ApiResponse(200, createdVideo, "Video Uploaded successfully"))
    
   } catch (error) {
        
    console.log("video uploading  Failed");
    if(video){
        
        await deleteFromCloudinary(video.public_id)
        console.log(video.public_id);
    }
    if(thumbnail){
        await deleteFromCloudinary(thumbnail.public_id)
        console.log(thumbnail.public_id);
        
    }
    throw new ApiError(400, "Something went wrong while uploading video and data were deleted  ");
    
   }

});


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // build the filter query 
    
    const filter = {};

    if (query) {
        // Case-insensitive search for titles
        filter.title = { $regex: query, $options: 'i' };
    }

    if (userId) {
        filter.userId = userId; // Filter videos by userId if provided
    }

    // Calculate pagination 
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Sort Configuration 
    const sortOptions = { [sortBy]: sortType === 'asc' ? 1 : -1 };

    try {
        // fetch videoUrl based on filters, sorting and pagination 
        const videos = await Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);


        const totalVideos = await Video.countDocuments(filter);



        res.status(200).json({
            success: true,
            data: videos,
            meta: {
                total: totalVideos,
                page: pageNumber,
                pages: Math.ceil(totalVideos / pageSize),
            },
        });


    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }

});



const getVideoById = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    //TODO: get videoUrl by id
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid video ID" });
        }

        const video = await Video.findById(id).populate("owner", "username email");

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        return res
        .status(201)
        .json(new ApiResponse(200, video, "Video fetched successfully"))

        // res.status(200).json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching video", error });
    }

});


const updateVideo = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    //TODO: update videoUrl details like title, description, thumbnail

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid video ID" });
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedVideo) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // res.status(200).json({ success: true, data: updatedVideo },"video updated successfully");
        return res
        .status(201)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))

        
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating video", error });
    }


});


const deleteVideo = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    //TODO: delete videoUrl

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid video ID" });
        }

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }
        console.log("Video::", video._id);
        
        // console.log("thumbnail._id: ",thumbnail._id);
        if(video){
        
            await deleteFromCloudinary(video._id)
            console.log(video._id);
        }
        
        // if(thumbnail){
        //     await deleteFromCloudinary(thumbnail._id)
        //     console.log(thumbnail._id);
            
        // }

        res.status(200).json({ success: true, message: "Video deleted successfully" });
        // return res
        // .status(201)
        // .json(new ApiResponse(200, "Video deleted successfully"))

    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting video", error });
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid video ID" });
        }

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        video.isPublished = !video.isPublished;
        await video.save();

        res.status(200).json({ success: true, data: video, message:"published video getting toggled successfully " });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error toggling publish status", error });
    }

});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

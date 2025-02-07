import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {

        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }
    
        const aggregateQuery = Comment.aggregate([
            { $match: { video: mongoose.Types.ObjectId(videoId) } },
            { $sort: { createdAt: -1 } }, // Sort by most recent
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                },
            },
            { $unwind: "$ownerDetails" }, // Deconstruct owner array
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    "ownerDetails._id": 1,
                    "ownerDetails.name": 1, // Example user details to include
                },
            },
        ]);
    
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };
    
        const comments = await Comment.aggregatePaginate(aggregateQuery, options);
    
        res.status(200).json(
            new ApiResponse(200, "Comments fetched successfully", comments)
        );
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while Accessing video comments ::", error)

    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and ID is available in `req.user`


        try {

            if (!mongoose.isValidObjectId(videoId)) {
                throw new ApiError(400, "Invalid video ID");
            }
        
            if (!content || content.trim().length === 0) {
                throw new ApiError(400, "Comment content cannot be empty");
            }
        
            const comment = await Comment.create({
                content,
                video: videoId,
                owner: userId,
            });
        
            res.status(201).json(
                new ApiResponse(201, "Comment added successfully", comment)
            );
            
        } catch (error) {
            throw new ApiError(501, "Something went wrong while adding  comment ::", error)

        }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Assuming user is authenticated and ID is available in `req.user`


    try {

        if (!mongoose.isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid comment ID");
        }
    
        if (!content || content.trim().length === 0) {
            throw new ApiError(400, "Comment content cannot be empty");
        }
    
        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, owner: userId },
            { content },
            { new: true, runValidators: true }
        );
    
        if (!comment) {
            throw new ApiError(404, "Comment not found or not authorized to edit");
        }
    
        res.status(200).json(
            new ApiResponse(200, "Comment updated successfully", comment)
        );
        
    } catch (error) {
        throw new ApiError(504, "Something went wrong while updating comment ::", error)

    }
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated and ID is available in `req.user`


    try {
        
        if (!mongoose.isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid comment ID");
        }
    
        const comment = await Comment.findOneAndDelete({
            _id: commentId,
            owner: userId,
        });
    
        if (!comment) {
            throw new ApiError(404, "Comment not found or not authorized to delete");
        }
    
        res.status(200).json(
            new ApiResponse(200, "Comment deleted successfully")
        );

    } catch (error) {
        throw new ApiError(503, "Something went wrong while deleting comment ::", error)

    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }

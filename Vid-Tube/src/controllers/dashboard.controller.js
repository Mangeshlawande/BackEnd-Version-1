import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params;

    try {

        if (!mongoose.isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channel ID");
        }

        // Fetch total videos uploaded by the channel
        const totalVideos = await Video.countDocuments({ uploadedBy: channelId });

        // Fetch total subscribers of the channel
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

        // Fetch total likes across all videos of the channel
        const videos = await Video.find({ uploadedBy: channelId }).select("_id");
        const videoIds = videos.map((video) => video._id);
        const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

        // Fetch total views across all videos of the channel
        const totalViews = await Video.aggregate([
            { $match: { uploadedBy: mongoose.Types.ObjectId(channelId) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]);

        const totalVideoViews = totalViews[0]?.totalViews || 0;

        res.status(200).json(
            new ApiResponse(200, "Channel stats retrieved successfully", {
                totalVideos,
                totalSubscribers,
                totalLikes,
                totalVideoViews,
            })
        );

    } catch (error) {
        throw new ApiError(500, "Something went wrong while Accessing channel status ::", error)
    }
});


const getChannelVideos = asyncHandler(async (req, res) => {

    // TODO: Get all the videos uploaded by the channel

    const { channelId } = req.params;

    try {

        if (!mongoose.isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channel ID");
        }

        // Fetch videos uploaded by the channel
        const videos = await Video.find({ uploadedBy: channelId }).sort({ createdAt: -1 });

        res.status(200).json(
            new ApiResponse(200, "Channel videos retrieved successfully", videos)
        );

    } catch (error) {

        throw new ApiError(500, "Something went wrong while Accessing channel videos ::", error);
    }

});

export {
    getChannelStats,
    getChannelVideos,
};
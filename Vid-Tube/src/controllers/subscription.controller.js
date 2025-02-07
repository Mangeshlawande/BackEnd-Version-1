import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId = req.user.id; // Assuming `req.user` contains the authenticated user's info
    try {
        
        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channel ID");
        }
    
        if (subscriberId === channelId) {
            throw new ApiError(400, "You cannot subscribe to yourself");
        }
    
        // Check if the subscription already exists
        const existingSubscription = await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId,
        });
    
        if (existingSubscription) {
            // If exists, remove the subscription (unsubscribe)
            await existingSubscription.deleteOne();
            return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
        } else {
            // Otherwise, create a new subscription
            await Subscription.create({ subscriber: subscriberId, channel: channelId });
            return res.status(200).json(new ApiResponse(201, "Subscribed successfully"));
        }

    } catch (error) {
        throw new ApiError(503, "something went wrong while Subscribing :: ", error);
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    
    try {
        
        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channel ID");
        }
    
        // Retrieve all subscriptions where the channel matches the provided channelId
        const subscribers = await Subscription.find({ channel: channelId })
            .populate("subscriber", "name email") // Populate subscriber details (assuming `name` and `email` exist on the User model)
            .exec();
    
        return res
            .status(200)
            .json(new ApiResponse(201, "Subscribers retrieved successfully", subscribers));

    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting Channel Subscribers:: ", error)
    }
});



// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // const { subscriberId } = req.params

    try {
        
        const subscriberId = req.user.id; // Assuming the authenticated user's ID is in `req.user`

        // Retrieve all subscriptions where the subscriber matches the authenticated user's ID
        const channels = await Subscription.find({ subscriber: subscriberId })
            .populate("channel", "name email") // Populate channel details (assuming `name` and `email` exist on the User model)
            .exec();
    
        return res
            .status(200)
            .json(new ApiResponse(201, "Subscribed channels retrieved successfully", channels));

    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting subscribers ::", error)
    }

});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
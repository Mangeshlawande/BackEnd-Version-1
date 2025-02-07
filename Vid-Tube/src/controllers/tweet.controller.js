import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet [ content and owner]
    // get data from request
    const {content} = req.body;
    
    if(!content ||content.trim().length===""){
        throw new ApiError(404, "Tweet content is required !!")
    }
        // Step 2: Optionally validate if the user exists (this step assumes user is authenticated)
    if(!req.user || !isValidObjectId(req.user._id)){
        throw new ApiError(403,"Invalid user or Missing user !!" );
    }
    
        // Step 3: Optionally validate user ID and get the user
    try {
            const user = await User.findById(req.user._id);

            if(!user){
                throw new ApiError(404, "user Not found !!");
            }

            // Step 4: Create the Tweet
            const newTweet = await Tweet.create({
                content,
                owner : req.user?._id
            })

            const createdTweet = await User.findById(user._id);

            if(!createdTweet){
                throw new ApiError(401, "Something went wrong while creating tweet");
            }

            return res
            .status(200)
            .json(new ApiResponse(201,newTweet, "Tweet created successfully"));

    } catch (error) {
       throw new ApiError(402, "Tweet creation is failed!! ") ;

    }
});


const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    // Get the userId from the request params or query
    const { userId } = req.params;
    console.log("userId:",userId);
    
    // Step 1: Validate the userId (check if it is a valid ObjectId)
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Step 2: Retrieve the tweets for the user
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 }) // Sort tweets by creation date in descending order
        .populate("owner", "name username") // Populate the user field with user name and username
        .exec();

    // Step 3: Check if any tweets were found
    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user");
    }

    // Step 4: Respond with the list of tweets
    const response = new ApiResponse({
        data: tweets,
        message: "User tweets retrieved successfully",
    });

    res.json(response);
   
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;  // Retrieve the tweet ID from the URL parameters
    const { content} = req.body;  // Fields to be updated

   try {
     // Step 1: Validate the tweetId (check if it is a valid ObjectId)
     if (!mongoose.isValidObjectId(tweetId)) {
         throw new ApiError(400, "Invalid tweet ID");
     }
 
     // Step 2: Find the tweet by its ID
     const tweet = await Tweet.findById(tweetId);
 
      // Step 3: If the tweet doesn't exist, throw an error
      if (!tweet) {
         throw new ApiError(404, "Tweet not found");
     }
 
      // Step 4: Check if the logged-in user is the owner of the tweet (optional)
     // Assuming req.user contains the authenticated user
     if (tweet.owner.toString() !== req.user._id.toString()) {
         throw new ApiError(403, "You are not authorized to update this tweet");
     }
 
       // Step 5: Update the tweet's content (or other fields)
       if (content) {
         tweet.content = content;  // Update the content of the tweet
     }
 
      // Step 6: Save the updated tweet
      const updatedTweet = await tweet.save();
 
          // Step 7: Respond with the updated tweet
     res.json({
         success: true,
         data: updatedTweet,
         message: "Tweet updated successfully",
     });
   } catch (error) {
    throw new ApiError(404, "Tweet updation Failed :", error);
   }

});


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params; // Extract the tweet ID from the request parameters

    try {
        // Step 1: Validate tweet ID (check if it's a valid ObjectId)
        if (!mongoose.isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID");
        }
    
        // Step 2: Find the tweet by its ID
        // const tweetdb = await Tweet.findById(tweetId);
    
    
        // Step 5: Delete the tweet from the database
        const tweetdb = await Tweet.findByIdAndDelete(tweetId);
        
        // Step 3: If the tweet doesn't exist, throw an error
        if (!tweetdb) {
            throw new ApiError(404, "Tweet not found");
        }
        
        // Step 4: Check if the logged-in user is the owner of the tweet (optional)
        // Assuming req.user contains the authenticated user
        if (tweetdb.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to delete this tweet");
        }
        
       
        
        // Step 6: Respond with a success message
        return res.
        status(200)
        .json(new ApiResponse(201, tweetdb, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(404, "Error occured While deleting Tweet ::", error)
    }

});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

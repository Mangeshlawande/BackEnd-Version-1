import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const ownerId = req.user.id; // Assuming `req.user` contains the authenticated user's info

    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner: ownerId,
        });
        
        res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist));

    } catch (error) {
        throw new ApiError(504, "Something went wrong creating playlist::", error );
    }

});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    try {
        
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
    
        const playlists = await Playlist.find({ owner: userId });
    
        res.status(200).json(new ApiResponse(200, "Playlists retrieved successfully", playlists));

    } catch (error) {
        throw new ApiError(500, "Something went wrong while Accessing playlist ::", error)
    }

});



const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    try {
        
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }
    
        const playlist = await Playlist.findById(playlistId).populate("videos");
    
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        res.status(200).json(new ApiResponse(200, "Playlist retrieved successfully", playlist));

    } catch (error) {
       throw new ApiError(501, "something went wrong while getting User playList::",error) ;
    }
    
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    try {
        
        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist or video ID");
        }
    
        const playlist = await Playlist.findById(playlistId);
    
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        // Avoid adding duplicate videos
        if (playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video is already in the playlist");
        }
    
        playlist.videos.push(videoId);
        await playlist.save();
    
        res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playlist));

    } catch (error) {
        throw new ApiError(504, "something went wrong while adding video::", error);
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    try {

        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist or video ID");
        }
    
        const playlist = await Playlist.findById(playlistId);
    
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        // Remove the video if it exists
        playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
        await playlist.save();
    
        res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playlist));
        
    } catch (error) {
        throw new ApiError(501, "Something went wrong while removing video::", error);
    }

});


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    try {
        
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }
    
        const playlist = await Playlist.findById(playlistId);
    
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        if (name) playlist.name = name;
        if (description) playlist.description = description;
    
        await playlist.save();
    
        res.status(200).json(new ApiResponse(200, "Playlist updated successfully", playlist));

    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating PlayList ::", error);
    }
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    try {
        
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }
    
        const playlist = await Playlist.findByIdAndDelete(playlistId);
    
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));

    } catch (error) {
        throw new ApiError(503, "Something went wrong while deleting Playist ::", error);
    }
    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
}

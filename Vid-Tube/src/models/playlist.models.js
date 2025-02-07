/**
 * owner ObjectId user
 * name string
 * video string

 * description string
 * owner
 * createdAt Date
 * updatedAt Date
 * 
 */


import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({ 
    name:{
        type: String, 
        required:true 
    },
   
    description:{
        type: String, 
    },

    videos:
    [
        {
        type: Schema.Types.ObjectId,
        ref:"Video"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User" 
    },
},{timestamps:true})

export const Playlist  = mongoose.model("PlayList", playlistSchema);

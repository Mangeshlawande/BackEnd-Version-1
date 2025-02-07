/**
 * owner ObjectId user
 * videoFile string
 * thumbnail string
 * title string
 * description string
 * duration number
 * views number
 * isPublished boolean
 * createdAt Date
 * updatedAt Date
 * 
 */


import mongoose, { Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({ 
    video:{
        type: String, // cloudinary url
        required:true 
    },
    thumbnail:{
        type: String, // cloudinary url
        required:true 
    },
    title:{
        type: String,
        required:true 
    },
    description:{
        type: String, 
    },
    views:{
        type: Number,
        default:0
    },
    duration:{
        type: Number,
        // required : true 
    },
    isPublished:{
        type: Boolean,
        default:true 
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User" 
    },
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)
// complex things to implement

export const Video  = mongoose.model("Video", videoSchema)

import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js"; // Multer middleware for handling file uploads
import { verifyJWT } from "../middlewares/auth.middlewares.js"; // Middleware for JWT authentication

const router = Router();

/**
 * Route to publish/upload a new video
 * - Requires authentication (JWT)
 * - Accepts two files: video and thumbnail
 */
router.post(
    "/publish-video",
    upload.fields([
        {
            name: "video",
            maxCount: 1
        }, // Single video file
        {
            name: "thumbnail",
            maxCount: 1
        }, // Single thumbnail image
    ]),
    verifyJWT, // Ensure the user is authenticated
    publishAVideo
);


/**
 * Route to retrieve all videos
 * - Publicly accessible
 */

router.get("/get-all-videos", getAllVideos);

/**
 * Route to get a specific video by its ID
 * - Publicly accessible
 */
router.get("/get-video-by-id/:id", getVideoById); // Use a route parameter for video ID

/**
 * Route to update video metadata
 * - Requires authentication (JWT)
 * - Updates title, description, or other metadata
 */
router.patch("/update-video/:id", updateVideo); // Use a route parameter for video ID

/**
 * Route to delete a video
 * - Requires authentication (JWT)
 */
router.delete("/delete-video/:id", deleteVideo); // Use a route parameter for video ID

/**
 * Route to toggle the publish status of a video
 * - Requires authentication (JWT)
 */
router.patch("/toggle-publish-status/:id", verifyJWT, togglePublishStatus); // Use a route parameter for video ID

export default router;

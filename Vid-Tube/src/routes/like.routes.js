import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,

} from '../controllers/like.controller.js';


import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router();

router.route("/toggle-comment-like").post(verifyJWT, toggleCommentLike);

router.route("/toggle-tweet-like").post(verifyJWT, toggleTweetLike);

router.route("/toggle-video-like").post(verifyJWT, toggleVideoLike);

router.route("/get-likeed-video").get(verifyJWT, getLikedVideos);



export default router

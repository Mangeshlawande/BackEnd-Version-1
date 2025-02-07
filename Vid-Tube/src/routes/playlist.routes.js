import { Router } from "express";
import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist

 } from "../controllers/playlist.controller.js";

import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router();



router.route("/create-playlist").post(verifyJWT, createPlaylist) //

router.route("/add-video-to-playlist").post(verifyJWT, addVideoToPlaylist) //

router.route("/get-user-playlists").get( verifyJWT, getUserPlaylists) //

router.route("/get-playlist-by-Id").get( verifyJWT, getPlaylistById)  // 

router.route("/remove-video-from-playlist").delete( verifyJWT, removeVideoFromPlaylist) // 


router.route("/update-playlist").patch( verifyJWT, updatePlaylist) // worked

router.route("/delete-playlist").delete( verifyJWT, deletePlaylist) 



export default router

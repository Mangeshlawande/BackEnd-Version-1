import { Router } from "express";
import {
     registerUser , 
    logoutUser, 
    loginUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
 } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router();

// unsecured routes


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount :1,
        },
        {
            name: "coverImage",
            maxCount :1,
        },
       
    ])
,registerUser)

router.route("/login").post(loginUser) //work
router.route("/refresh-token").post(refreshAccessToken) // worked properly 


// secured routes

router.route("/logout").post( verifyJWT, logoutUser) // it can transfer the control sequentially  // work


router.route("/change-password").post( verifyJWT, changeCurrentPassword)  // work

router.route("/current-user").get( verifyJWT, getCurrentUser) //worked and no need to give jwt

router.route("/c/:username").get( verifyJWT, getUserChannelProfile) // worked
router.route("/update-account").patch( verifyJWT, updateAccountDetails) // worked

router.route("/avatar").patch( verifyJWT, upload.single("avatar"), updateUserAvatar)//worked

router.route("/cover-image").patch( verifyJWT, upload.single("coverImage"), updateUserCoverImage) 

router.route("/history").get( verifyJWT, getWatchHistory) 



export default router

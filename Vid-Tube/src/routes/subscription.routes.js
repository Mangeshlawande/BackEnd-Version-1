import { Router } from "express";
import { 
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
 } from "../controllers/subscription.controller.js";

import {verifyJWT} from "../middlewares/auth.middlewares.js"


const router = Router();


// secured routes

router.route("/toggle-Subscription").post( verifyJWT, toggleSubscription );


router.route("/get-user-Channel-Subscribers").get( verifyJWT, getUserChannelSubscribers) // it can transfer the control sequentially  // 


router.route("/get-Subscribed-Channels").post( verifyJWT, getSubscribedChannels)  // 


export default router

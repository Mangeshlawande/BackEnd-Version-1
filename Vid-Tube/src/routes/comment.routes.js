import {Router} from 'express';
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/comment.controller.js';


import { verifyJWT } from '../middlewares/auth.middlewares.js';


const router = Router();


router.route("/get-video-comments").get(verifyJWT, getVideoComments);

router.route("/add-comment").post(verifyJWT, addComment);

router.route("/update-comment").patch(verifyJWT, updateComment);

router.route("/delete-comment").delete(verifyJWT, deleteComment);


export default router;

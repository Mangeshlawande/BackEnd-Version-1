import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

// who should be able to talk to db :: cors policy/source 
//define middlewares ::
app.use(
    cors({
        origin :process.env.CORS_ORIGIN,
        credentials : true,
    })
);

// common middleware to secure application

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(express.static("public"));
//  make outside the source folder

app.use(cookieParser());

// next :: make db connection

//next :: 

//import routes

 import healthcheckRouter from './routes/healthcheck.routes.js';

 import userRouter from "./routes/user.routes.js"; 

 import videoRouter from './routes/video.routes.js' ;

 import TweetRouter from './routes/tweet.routes.js';

 import subscriptionRouter from './routes/subscription.routes.js';

 import playlistRouter from './routes/playlist.routes.js';

 import likeRouter from './routes/like.routes.js';
 
 import commentRouter from './routes/comment.routes.js';

 import dashboardRouter from './routes/dashboard.routes.js';

// bring routes itself 

// routes :: where do you want to serve this route

app.use("/api/v1/healthcheck", healthcheckRouter); //checked

app.use("/api/v1/user", userRouter);// checked 

app.use("/api/v1/video", videoRouter); // checked 

app.use("/api/v1/tweet", TweetRouter); // checked 

app.use("/api/v1/subscription", subscriptionRouter);

app.use("/api/v1/playlists", playlistRouter);

app.use("/api/v1/likes", likeRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/dashboard", dashboardRouter);



app.use(errorHandler)

export {app} 
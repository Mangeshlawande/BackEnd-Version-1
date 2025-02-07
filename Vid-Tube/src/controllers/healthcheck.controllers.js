import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck =  asyncHandler(async (req,res)=>{
return res.status(200).json(new ApiResponse(200, "OK", "health check passsed"))
}) 
export {healthcheck}

// export default healthcheck

// ready to create routes
// each of model get controller, each controller will gets its routes 
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8000 

connectDB()
.then(()=>{
app.listen(PORT, ()=>{
    console.log(`Server is running on port :: ${PORT}`);  
})
})
.catch((err)=>{
    console.log(`MongoDB Connection Error : ${err}`);
})












// console.log("Hello from Mangesh with backend Course . ");
// console.log("You can inject your custom loggers learns from previous videos. ");

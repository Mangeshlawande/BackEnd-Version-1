import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=> {
    try {
      const connectionInstance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

      console.log(`\n MongoDB Connected ! DB Host : ${connectionInstance.connection.host}`);
      
    } catch (error) {
        console.log(`MongoDbB Connection Error =>`, error);
        process.exit(1);
        
    }
}

export default connectDB

// try catch 
// async await :: 

// let user = {"username" :"mangeshlawande",
// "password" : "v7jtXaQyHwWD6JuY"}
// console.log(user[username])


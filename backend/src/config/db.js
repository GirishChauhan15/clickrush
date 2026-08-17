import mongoose from "mongoose";
import { dbName } from '../constant.js'

export async function connectDB() {
    if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }
  try {
    const res = await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`)
    // console.log(`MongoDB connected: ${res.connection.host}`);
  } catch (error) {
        // console.log("MongoDb connection error - ",error)
        process.exit(1)
  }
}
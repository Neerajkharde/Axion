import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        
        const conn = await mongoose.connect(`${process.env.MONGO_URI}axion`);  
        console.log("Database Connected !");

    } catch (error) {
        console.log("Error connecting to database");
        process.exit(1);
    }
};
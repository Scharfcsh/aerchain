import mongoose from "mongoose";
const MONGOURI= process.env.MONGO_DB_URI

const connectDB = async () => {

    console.log("Connecting to MongoDB...==========================", MONGOURI);
    try {
        await mongoose.connect(MONGOURI);


        console.log(`Connected to MongoDB!!!`);

    }
    catch (error) {
        console.log("Connection Error in (/DB/index): ", error);
        process.exit(1);
    }
}

export default connectDB;
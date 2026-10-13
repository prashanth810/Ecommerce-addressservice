import mongoose, { mongo } from "mongoose";
import Envs from "../utils/Envs.js";

const mongo_url = Envs.MONGO_URL;

const ConnecionDB = async () => {
    try {
        await mongoose.connect(mongo_url);
        console.log(`Address mongodb is connected successfully !!`);
    }
    catch (error) {
        console.log(error.message);
    }
}

export default ConnecionDB;
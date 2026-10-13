import express from "express";
import Authmiddleware from "../middleware/Authmiddleware.js";
import { AddAddress, Deleteaddress, GetAllAddress, Updateaddress, Getsingleaddress, makeitdefault } from "../controllers/Addresscontrollers.js";
import Ratelimit from "../models/Ratelimit.js";

const Addressroute = express.Router();

// add new address
Addressroute.post("/address/add", Ratelimit(
    60 * 1000,      // 1 minute window
    5,              // 5 attempts
    5 * 60 * 1000   // 5 minute cooldown
), Authmiddleware, AddAddress);

// update the address 
Addressroute.put("/address/update/:id", Ratelimit(
    60 * 1000,      // 1 minute window
    5,              // 5 attempts
    5 * 60 * 1000   // 5 minute cooldown
), Authmiddleware, Updateaddress);

// delete address 
Addressroute.delete("/address/delete/:id", Ratelimit(
    60 * 1000,      // 1 minute window
    5,              // 5 attempts
    5 * 60 * 1000   // 5 minute cooldown
), Authmiddleware, Deleteaddress);

// get all addresss list
Addressroute.get("/address/all", Ratelimit(
    60 * 1000,      // 1 minute window
    10,              // 5 attempts
    5 * 60 * 1000   // 5 minute cooldown
), Authmiddleware, GetAllAddress);

// make address default
Addressroute.put("/address/make-default", Ratelimit(
    60 * 1000,      // 1 minute window
    20,              // 5 attempts
    5 * 60 * 1000   // 5 minute cooldown
), Authmiddleware, makeitdefault);

// get single address  
Addressroute.get("/address/:id", Authmiddleware, Getsingleaddress);

export default Addressroute;
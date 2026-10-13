import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    full_name: {
        type: String,
        trim: true,
        required: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
    },
    building_number: {
        type: String,
        trim: true,
        required: true,
    },
    street: {
        type: String,
        trim: true,
        required: true,
    },
    landmark: {
        type: String,
        trim: true,
        required: true,
    },
    city: {
        type: String,
        trim: true,
        required: true,
    },
    state: {
        type: String,
        trim: true,
        required: true,
    },
    pincode: {
        type: String,
        trim: true,
        required: true,
    },
    country: {
        type: String,
        default: "India",
        trim: true,
    },
    address_type: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home",
    },
    is_default: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const AddressModel = mongoose.model("Address", AddressSchema);

export default AddressModel;
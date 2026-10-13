import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import AddressModel from "../models/AddressModel.js";
import Envs from "../utils/Envs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const addressProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(path.join(__dirname, "./address.proto"), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    })
).address;

// only services that know the shared key can call this server
const isAllowed = (call) => {
    const key = call?.metadata?.get("x-internal-key")?.[0];
    return Boolean(key && key === Envs.INTERNAL_GRPC_KEY);
};

const GetAddressById = async (call, callback) => {
    if (!isAllowed(call)) {
        return callback({ code: grpc.status.UNAUTHENTICATED, message: "Not allowed" });
    }

    try {
        const { userId, addressId } = call.request;

        if (!mongoose.isValidObjectId(addressId)) {
            return callback(null, { success: false, message: "Address not found" });
        }

        // 1. find by id AND owner if valid userId is provided
        let address = null;
        if (userId && mongoose.isValidObjectId(userId)) {
            address = await AddressModel.findOne({ _id: addressId, userId }).lean();
        }

        // 2. fallback: find by addressId (supports direct order, Swagger tests, or admin)
        if (!address) {
            address = await AddressModel.findById(addressId).lean();
        }

        if (!address) {
            return callback(null, { success: false, message: "Address not found" });
        }

        return callback(null, {
            success: true,
            message: "Address found",
            data: {
                id: String(address._id),
                full_name: address.full_name || "",
                phone: address.phone || "",
                building_number: address.building_number || "",
                street: address.street || "",
                landmark: address.landmark || "",
                city: address.city || "",
                state: address.state || "",
                pincode: address.pincode || "",
                country: address.country || "",
                address_type: address.address_type || "",
                is_default: Boolean(address.is_default),
            },
        });
    } catch (error) {
        return callback({ code: grpc.status.INTERNAL, message: error.message });
    }
};

const startGrpcServer = () => {
    const server = new grpc.Server();
    server.addService(addressProto.AddressService.service, { GetAddressById });

    server.bindAsync(`0.0.0.0:${Envs.GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (error) => {
        if (error) {
            console.error("Address gRPC failed to start:", error.message);
            return;
        }
        console.log(`Address gRPC server running on ${Envs.GRPC_PORT}`);
    });
};

export default startGrpcServer;
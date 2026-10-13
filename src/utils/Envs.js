import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const Envs = {
    PORT: env.PORT,
    MONGO_URL: env.MONGO_URL,
    JWT_SECRET: env.JWT_SECRET || env.JSON_SECRET,
    GRPC_PORT: env.GRPC_PORT || 3003,
    INTERNAL_GRPC_KEY: env.INTERNAL_GRPC_KEY || "ecommerce_grpc_internal_secret_key_2026",
}

export default Envs;
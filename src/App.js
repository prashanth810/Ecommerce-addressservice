import express from "express";
import cors from "cors";
import morgan from "morgan";
import Envs from "./utils/Envs.js";
import ConnecionDB from "./config/ConnecionDB.js";
import Addressroute from "./routes/Addressroutes.js";
import startGrpcServer from "./grpc/grpcServer.js";
import healthRouter from "./health/health.routes.js";
import { startKeepAlive } from "./health/keepAlive.js";


const PORT = Envs.PORT || 5000;
const API_BASE = "/api/auth/v4";

const app = express();

// Render (and most hosts) put a proxy in front of the app.
// Without this, req.ip is the proxy's IP, so every user shares ONE rate-limit bucket.
// 1 = direct from Render. Set TRUST_PROXY=2 when requests are forwarded by the payment service.
app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));


// Open this URL in the browser to confirm the ADDRESS service is the one deployed
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "From address backend !!!",
    });
});

// address routes
app.use(API_BASE, Addressroute);

app.use("/health", healthRouter);


// unknown route -> JSON instead of the default HTML "Cannot GET ..." page
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
        hint: `This is the address service. Address APIs live under ${API_BASE}/address/...`,
    });
});

// any error thrown inside a route / middleware
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message });
});


ConnecionDB().then(() => {
    app.listen(PORT, () => {
        console.log(`address service is running at port no ${PORT} !!`);
        console.log(`address APIs available at ${API_BASE}/address/*`);
    })
    // gRPC server (used by the payment / order service)
    startGrpcServer();
    startKeepAlive();
})
    .catch((error) => {
        console.log("server failed connect !!!", error.message);
    })
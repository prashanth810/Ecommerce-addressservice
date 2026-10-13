import express from "express";
import cors from "cors";
import morgan from "morgan";
import Envs from "./utils/Envs.js";
import ConnecionDB from "./config/ConnecionDB.js";
import Addressroute from "./routes/Addressroutes.js";
import startGrpcServer from "./grpc/grpcServer.js";


const PORT = Envs.PORT;

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));


app.get("/", (req, res) => {
    return res.status(200).json({ success: true, message: "From address backend !!!" });
});

// address routes 
app.use("/api/auth/v4", Addressroute);




ConnecionDB().then(() => {
    app.listen(PORT, () => {
        console.log(`address service is running at port no ${PORT} !!`);
    })
    // gRPC server (used by the payment / order service)
    startGrpcServer();
})
    .catch((error) => {
        console.log("server failed connect !!!");
    })
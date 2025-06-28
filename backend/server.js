import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();
connectDB();
connectCloudinary();

// ✅ Configure CORS to allow your frontend domain
const allowedOrigins = [
  "https://doctor-appointment-panel1.vercel.app",
  "http://localhost:5174" // if you're also testing locally
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow no origin (like curl, Postman) or allowed ones
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.options('*', cors()); // ✅ Preflight support

// ✅ Middlewares
app.use(express.json());

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Root test
app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ Export for Vercel
export default app;

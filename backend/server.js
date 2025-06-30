import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// ✅ Connect to MongoDB and Cloudinary
connectDB();
connectCloudinary();

// ✅ CORS Configuration (updated to use your actual frontend)
const allowedOrigins = [
  "https://doctor-appointment-panel.vercel.app",  // ✅ your frontend (NO slash at end)
  "http://localhost:5174"                          // ✅ for local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ Export for Vercel Serverless Function
export default app;

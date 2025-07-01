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

// ✅ Allowed frontend and admin origins
const allowedOrigins = [
  "https://doctor-appointment-panel.vercel.app",       // Admin
  "https://doctor-appointment-panel-user.vercel.app",  // User Frontend
  "http://localhost:5173",                             // Dev Frontend
  "http://localhost:5174",                             // Dev Admin
];

// ✅ CORS config with origin checking
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "dtoken"],
  credentials: true,
}));

// ✅ Preflight response
app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ Export Express App for Vercel
export default app;

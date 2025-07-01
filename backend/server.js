import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// ✅ Connect DB and Cloudinary
connectDB();
connectCloudinary();

// ✅ Allowed Origins (Dev + Production)
const allowedOrigins = [
  "https://doctor-appointment-panel-admin.vercel.app",  // Admin Panel (Prod)
  "https://doctor-appointment-panel-user.vercel.app",   // User Panel (Prod)
  "http://localhost:5173",                              // User (Dev)
  "http://localhost:5174",                              // Admin (Dev)
];

// ✅ CORS Middleware (Dynamic)
app.use(
  cors({
    origin: (origin, callback) => {
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
  })
);

// ✅ Handle preflight (OPTIONS)
app.options("*", cors());

// ✅ JSON Parsing Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Health Check
app.get("/", (req, res) => {
  res.status(200).send("API Working ✅");
});

// ✅ Export app for Vercel
export default app;

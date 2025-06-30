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

// ✅ CORS Configuration (updated to allow frontend + admin)
const allowedOrigins = [
  "https://doctor-appointment-panel.vercel.app",       // Admin
  "https://doctor-appointment-panel-user.vercel.app",  // Frontend 👈 added
  "http://localhost:5173",                             // Frontend dev
  "http://localhost:5174",                             // Admin dev
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
  allowedHeaders: ["Content-Type", "Authorization", "token", "dtoken"],
  credentials: true,
}));

// ✅ Preflight requests
app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ Export for Vercel
export default app;

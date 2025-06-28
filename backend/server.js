import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// 🔌 Database & Cloudinary connections
connectDB();
connectCloudinary();

// ✅ CORS Setup
const allowedOrigins = [
  "https://doctor-appointment-panel1.vercel.app", // ✅ your deployed frontend
  "http://localhost:5174" // ✅ local dev frontend (optional)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },
  credentials: true
}));

app.options("*", cors()); // ✅ enable preflight requests

// ✅ Middlewares
app.use(express.json());

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// ✅ Export for Vercel
export default app;

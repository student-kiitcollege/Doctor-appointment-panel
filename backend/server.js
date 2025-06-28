import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// ✅ Connect database and cloud
connectDB();
connectCloudinary();

// ✅ CORS configuration (must come early)
const allowedOrigins = [
  "https://doctor-appointment-panel1.vercel.app",  // your frontend
  "http://localhost:5174"                           // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle OPTIONS requests early
app.options("*", cors());

// ✅ Other middlewares
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

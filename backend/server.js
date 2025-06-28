import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

// App setup
const app = express();
connectDB();
connectCloudinary();

// ✅ Setup CORS with allowed origin
const allowedOrigins = [
  "https://doctor-appointment-panel1.vercel.app", // Your frontend
  "http://localhost:5174" // Optional for local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
}));

// Preflight support
app.options("*", cors());

// Middlewares
app.use(express.json());

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ Export for Vercel deployment
export default app;

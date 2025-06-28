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

// ✅ Define CORS origin whitelist
const allowedOrigins = [
  "https://doctor-appointment-panel1.vercel.app",
  "http://localhost:5174"
];

// ✅ Configure CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-access-token",
      "aToken",
      "dToken"
    ]
  })
);

// ✅ Allow OPTIONS preflight requests
app.options("*", cors());

app.use(express.json());

// ✅ All routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
  res.send("API Working ✅");
});

// ✅ Export handler for Vercel
export default app;

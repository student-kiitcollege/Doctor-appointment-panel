import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    // ✅ Get the Bearer token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Optional: Check hardcoded admin identity
    const isValidAdmin =
      decoded.email === process.env.ADMIN_EMAIL &&
      decoded.password === process.env.ADMIN_PASSWORD;

    if (!isValidAdmin) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    // ✅ Proceed to next middleware
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

export default authAdmin;

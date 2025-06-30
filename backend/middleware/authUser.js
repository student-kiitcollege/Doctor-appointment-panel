import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info to request
    req.user = {
      userId: decoded.id,
      email: decoded.email,
      role: "user"
    };

    next();
  } catch (error) {
    console.error("User Auth Error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

export default authUser;

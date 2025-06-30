import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // ✅ Attach decoded user info to request
    req.user = {
      userId: decoded.id,
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Error:", error.message);

    // Send unauthorized response
    return res.status(401).json({
      success: false,
      message: "Unauthorized: " + (error.name === "JsonWebTokenError" ? "Invalid token" : error.message),
    });
  }
};

export default authUser;

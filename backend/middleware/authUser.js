import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Attach decoded user info to request as req.user.id (match JWT payload)
    req.user = {
      id: decoded.id,
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message:
        "Unauthorized: " +
        (error.name === "JsonWebTokenError" ? "Invalid token" : error.message),
    });
  }
};

export default authUser;

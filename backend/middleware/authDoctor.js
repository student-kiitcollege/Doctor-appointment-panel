import jwt from "jsonwebtoken";

// Doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Validate token presence
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach doctor ID to request for downstream use
    req.user = {
      docId: decoded.id,
      email: decoded.email,
      role: "doctor"
    };

    next();
  } catch (error) {
    console.error("Doctor Auth Error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

export default authDoctor;

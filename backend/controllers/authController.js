const admin = require("../config/firebase");

const verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please include a Bearer token.",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return res.status(200).json({
      success: true,
      message: "Token verified successfully.",
      user: {
        uid: decodedToken.uid,
        phone: decodedToken.phone_number || null,
        authTime: new Date(decodedToken.auth_time * 1000).toISOString(),
        expTime: new Date(decodedToken.exp * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session verification failed. Please log in again.",
    });
  }
};

module.exports = { verifyToken };

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");

// POST /api/auth/verify-token
router.post("/verify-token", verifyToken);

module.exports = router;

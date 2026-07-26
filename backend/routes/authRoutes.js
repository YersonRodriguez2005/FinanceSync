// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser, updateUserProfile, resetPasswordDirect } = require("../controllers/authController");
const { protect } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put('/profile', protect, updateUserProfile);
router.post('/reset-password-direct', resetPasswordDirect);

module.exports = router;

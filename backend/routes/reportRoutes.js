// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { generatePdfExtract } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

// Endpoint para descargar el PDF
router.get('/extract', protect, generatePdfExtract);

module.exports = router;
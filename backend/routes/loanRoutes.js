// routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const { getLoans, createLoan, payLoan, deleteLoan, updateLoan } = require('../controllers/loanController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getLoans);
router.post('/', protect, createLoan);
router.patch('/:id/pay', protect, payLoan);
router.put('/:id', protect, updateLoan);
router.delete('/:id', protect, deleteLoan);

module.exports = router;
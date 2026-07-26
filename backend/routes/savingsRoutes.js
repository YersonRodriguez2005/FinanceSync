// routes/savingsRoutes.js
const express = require('express');
const router = express.Router();
const { getSavings, createSaving, addMoney, deleteSavingGoal, updateSavingGoal } = require('../controllers/savingsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getSavings);
router.post('/', protect, createSaving);
router.patch('/:id/add-funds', protect, addMoney);
router.put('/:id', protect, updateSavingGoal);
router.delete('/:id', protect, deleteSavingGoal);

module.exports = router;
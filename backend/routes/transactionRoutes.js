// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction, updateTransaction } = require('../controllers/transactionController');

// Importamos a nuestro guardia de seguridad
const { protect } = require('../middlewares/authMiddleware');

// RUTAS PROTEGIDAS
// Crea una nueva transacción
router.post('/', protect, createTransaction);

// Devuelve el historial del usuario
router.get('/', protect, getTransactions);

// Actualiza una transacción específica
router.put('/:id', protect, updateTransaction);

// Elimina una transacción específica
router.delete('/:id', protect, deleteTransaction);


module.exports = router;
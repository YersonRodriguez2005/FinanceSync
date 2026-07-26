// controllers/transactionController.js
const {
  createTransactionDB,
  getTransactionsByUserDB,
  deleteTransactionDB,
  updateTransactionDB,
} = require("../models/transactionModel");

// CREAR TRANSACCIÓN
const createTransaction = async (req, res) => {
  try {
    // Obtenemos el ID del usuario directamente del Token (gracias al middleware)
    const userId = req.user.id;

    // Extraemos los datos que envía la app móvil
    const {
      category_id,
      amount,
      date,
      description,
      is_recurring,
      billing_day,
    } = req.body;

    // 1. VALIDACIÓN BÁSICA
    if (!category_id || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "La categoría, el monto y la fecha son obligatorios.",
      });
    }

    // 2. VALIDACIÓN DE NEGOCIO (Reglas de recurrencia)
    if (is_recurring && (!billing_day || billing_day < 1 || billing_day > 31)) {
      return res.status(400).json({
        success: false,
        message:
          "Para gastos recurrentes, debes especificar un día de cobro válido (1-31).",
      });
    }

    // 3. GUARDAR EN BASE DE DATOS
    const newTransaction = await createTransactionDB(
      userId,
      category_id,
      amount,
      date,
      description,
      is_recurring || false,
      billing_day || null,
    );

    res.status(201).json({
      success: true,
      message: "Transacción registrada con éxito",
      data: newTransaction,
    });
  } catch (error) {
    console.error("Error al crear transacción:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al guardar.",
    });
  }
};

// OBTENER HISTORIAL DE TRANSACCIONES
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const month = req.query.month || new Date().getMonth() + 1;
        const year = req.query.year || new Date().getFullYear();
        
        // 🟢 NUEVA LÓGICA DE PAGINACIÓN
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; 
        
        // Fórmula: Si pag = 1, salto 0. Si pag = 2, salto 20...
        const offset = (page - 1) * limit;

        // Llamamos a tu función con los nuevos parámetros
        const transactions = await getTransactionsByUserDB(userId, month, year, limit, offset);

        // Si devolvemos exactamente el límite (ej. 20), asumimos que hay más en la base de datos
        const hasMore = transactions.length === limit; 

        res.status(200).json({ 
            success: true, 
            data: transactions,
            pagination: { page, limit, hasMore } 
        });
    } catch (error) {
        console.error('🔥 ERROR AL OBTENER TRANSACCIONES:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// Eliminar
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const deletedTx = await deleteTransactionDB(transactionId, userId);

    if (!deletedTx) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Transacción no encontrada o no autorizada.",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Transacción eliminada con éxito." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error interno al eliminar." });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { amount, category_id, description, date } = req.body;

    const updated = await updateTransactionDB(
      transactionId,
      userId,
      amount,
      category_id,
      description,
      date,
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Transacción no encontrada" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("🔥 ERROR AL ACTUALIZAR TRANSACCIÓN:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
};

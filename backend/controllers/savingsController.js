// controllers/savingsController.js
const {
  getSavingsDB,
  createSavingDB,
  addMoneyToSavingDB,
  deleteSavingGoalDB,
  updateSavingGoalDB,
} = require("../models/savingsModel");

const getSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const savings = await getSavingsDB(userId);
    res.status(200).json({ success: true, data: savings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener ahorros." });
  }
};

const createSaving = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, target_amount, deadline } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({
        success: false,
        message: "El nombre y la meta (target_amount) son obligatorios.",
      });
    }

    const newSaving = await createSavingDB(
      userId,
      name,
      target_amount,
      deadline || null,
    );
    res.status(201).json({ success: true, data: newSaving });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al crear la meta de ahorro." });
  }
};

const addMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const savingId = req.params.id; // Viene en la URL /api/savings/123/add
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "El monto a aportar debe ser mayor a cero.",
      });
    }

    const updatedSaving = await addMoneyToSavingDB(savingId, userId, amount);

    if (!updatedSaving) {
      return res
        .status(404)
        .json({ success: false, message: "Meta de ahorro no encontrada." });
    }

    res.status(200).json({
      success: true,
      message: "Aporte registrado con éxito.",
      data: updatedSaving,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al registrar el aporte." });
  }
};

const deleteSavingGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const deletedGoal = await deleteSavingGoalDB(goalId, userId);

    if (!deletedGoal) {
      return res
        .status(404)
        .json({ success: false, message: "Meta no encontrada." });
    }

    res
      .status(200)
      .json({ success: true, message: "Meta eliminada con éxito." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar la meta." });
  }
};

const updateSavingGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, target_amount } = req.body;

    const updated = await updateSavingGoalDB(
      req.params.id,
      userId,
      name,
      target_amount,
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Meta no encontrada" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

module.exports = {
  getSavings,
  createSaving,
  addMoney,
  deleteSavingGoal,
  updateSavingGoal,
};

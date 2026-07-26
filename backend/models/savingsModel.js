// models/savingsModel.js
const pool = require("../config/db");

// Obtener todas las metas de ahorro del usuario
const getSavingsDB = async (userId) => {
  const query = `
        SELECT * FROM savings_goals 
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Crear una nueva meta
const createSavingDB = async (userId, name, targetAmount, deadline) => {
  const query = `
        INSERT INTO savings_goals (user_id, name, target_amount, deadline)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
  const result = await pool.query(query, [
    userId,
    name,
    targetAmount,
    deadline,
  ]);
  return result.rows[0];
};

// Aportar dinero a una meta de ahorro
const addMoneyToSavingDB = async (savingId, userId, amountToAdd) => {
  // Usamos SET current_amount = current_amount + $1 para sumar matemáticamente en la BD
  const query = `
        UPDATE savings_goals 
        SET current_amount = current_amount + $1 
        WHERE id = $2 AND user_id = $3
        RETURNING *;
    `;
  const result = await pool.query(query, [amountToAdd, savingId, userId]);
  return result.rows[0];
};

const deleteSavingGoalDB = async (goalId, userId) => {
  const query = `
        DELETE FROM savings_goals 
        WHERE id = $1 AND user_id = $2 
        RETURNING id;
    `;
  const result = await pool.query(query, [goalId, userId]);
  return result.rows[0];
};

const updateSavingGoalDB = async (id, userId, name, targetAmount) => {
  const query = `
        UPDATE savings_goals 
        SET name = $1, target_amount = $2 
        WHERE id = $3 AND user_id = $4 
        RETURNING *;
    `;
  const result = await pool.query(query, [name, targetAmount, id, userId]);
  return result.rows[0];
};

module.exports = {
  getSavingsDB,
  createSavingDB,
  addMoneyToSavingDB,
  deleteSavingGoalDB,
  updateSavingGoalDB,
};

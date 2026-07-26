// models/transactionModel.js
const pool = require("../config/db");

// Función para registrar un nuevo ingreso/gasto
const createTransactionDB = async (
  userId,
  categoryId,
  amount,
  date,
  description,
  isRecurring,
  billingDay,
) => {
  const query = `
        INSERT INTO transactions 
        (user_id, category_id, amount, date, description, is_recurring, billing_day)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
    `;
  const values = [
    userId,
    categoryId,
    amount,
    date,
    description,
    isRecurring,
    billingDay,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Función para obtener el historial del usuario
const getTransactionsByUserDB = async (userId, month, year, limit = 20, offset = 0) => {
    let query = `
        SELECT 
            t.id, t.amount, t.date, t.description, t.is_recurring,
            c.name AS category_name, c.type AS category_type, c.color, c.icon
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
    `;
    
    const values = [userId];
    let paramIndex = 2;

    if (month && year) {
        query += ` AND EXTRACT(MONTH FROM t.date) = $${paramIndex} AND EXTRACT(YEAR FROM t.date) = $${paramIndex + 1}`;
        values.push(month, year);
        paramIndex += 2;
    }

    query += ` ORDER BY t.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1};`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
};

// Eliminar transacción
const deleteTransactionDB = async (transactionId, userId) => {
  const query = `
        DELETE FROM transactions 
        WHERE id = $1 AND user_id = $2 
        RETURNING id;
    `;
  const result = await pool.query(query, [transactionId, userId]);
  return result.rows[0];
};

const updateTransactionDB = async (
  id,
  userId,
  amount,
  categoryId,
  description,
  date,
) => {
  const query = `
        UPDATE transactions 
        SET amount = $1, category_id = $2, description = $3, date = $4 
        WHERE id = $5 AND user_id = $6 
        RETURNING *;
    `;
  const result = await pool.query(query, [
    amount,
    categoryId,
    description,
    date,
    id,
    userId,
  ]);
  return result.rows[0];
};

module.exports = {
  createTransactionDB,
  getTransactionsByUserDB,
  deleteTransactionDB,
  updateTransactionDB,
};

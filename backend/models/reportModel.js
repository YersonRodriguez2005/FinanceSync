// models/reportModel.js
const pool = require("../config/db");

const getTransactionsForReportDB = async (userId, month, year) => {
  const query = `
        SELECT t.date, t.description, t.amount, c.name AS category_name, c.type 
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3
        ORDER BY t.date ASC; -- Orden cronológico para el extracto
    `;
  const result = await pool.query(query, [userId, month, year]);
  return result.rows;
};

module.exports = { getTransactionsForReportDB };

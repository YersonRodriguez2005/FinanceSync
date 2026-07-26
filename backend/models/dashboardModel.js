// models/dashboardModel.js
const pool = require('../config/db');

// Obtener Ingresos Totales, Gastos Totales y Balance del Mes
const getMonthlySummaryDB = async (userId, month, year) => {
    // Usamos EXTRACT para filtrar solo las transacciones del mes y año solicitados
    const query = `
        SELECT 
            COALESCE(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3;
    `;
    const result = await pool.query(query, [userId, month, year]);
    return result.rows[0];
};

// Obtener Gastos agrupados por Categoría (Para el Gráfico)
const getExpensesByCategoryDB = async (userId, month, year) => {
    // Agrupamos (GROUP BY) por categoría y sumamos los montos
    const query = `
        SELECT c.name, c.color, c.icon, SUM(t.amount) AS total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 
          AND c.type = 'EXPENSE'
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total DESC; -- Ordenamos para que la categoría en la que más gastó salga de primera
    `;
    const result = await pool.query(query, [userId, month, year]);
    return result.rows;
};

// NUEVA FUNCIÓN: Obtiene la tendencia diaria de ingresos y gastos
const getDailyTrendDB = async (userId, month, year) => {
    const query = `
        SELECT 
            EXTRACT(DAY FROM t.date) AS day,
            SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END) AS income,
            SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END) AS expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3
        GROUP BY EXTRACT(DAY FROM t.date)
        ORDER BY day ASC;
    `;
    const result = await pool.query(query, [userId, month, year]);
    return result.rows;
};

module.exports = { getMonthlySummaryDB, getExpensesByCategoryDB, getDailyTrendDB };
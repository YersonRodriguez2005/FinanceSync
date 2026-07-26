// models/loanModel.js
const pool = require('../config/db');

// Obtener todos los préstamos de un usuario
const getLoansDB = async (userId) => {
    const query = `
        SELECT * FROM loans 
        WHERE user_id = $1 
        ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Registrar un nuevo préstamo
const createLoanDB = async (userId, debtorName, totalAmount, type) => {
    const query = `
        INSERT INTO loans (user_id, debtor_name, total_amount, amount_paid, status, type) 
        VALUES ($1, $2, $3, 0, 'ACTIVE', $4) 
        RETURNING *;
    `;
    // Insertamos 0 en amount_paid y 'ACTIVE' en status por defecto al crear
    const result = await pool.query(query, [userId, debtorName, totalAmount, type]);
    return result.rows[0];
};

// Registrar un abono (pago) al préstamo
const payLoanDB = async (loanId, userId, amountToPay) => {
    // 1. Primero sumamos el dinero pagado
    const updateQuery = `
        UPDATE loans 
        SET amount_paid = amount_paid + $1
        WHERE id = $2 AND user_id = $3
        RETURNING *;
    `;
    let result = await pool.query(updateQuery, [amountToPay, loanId, userId]);
    let updatedLoan = result.rows[0];

    if (!updatedLoan) return null;

    // 2. LÓGICA DE NEGOCIO EN BASE DE DATOS: 
    if (parseFloat(updatedLoan.amount_paid) >= parseFloat(updatedLoan.total_amount)) {
        const statusQuery = `
            UPDATE loans SET status = 'PAID' WHERE id = $1 RETURNING *;
        `;
        const statusResult = await pool.query(statusQuery, [loanId]);
        updatedLoan = statusResult.rows[0];
    }

    return updatedLoan;
};

const deleteLoanDB = async (loanId, userId) => {
    const query = `DELETE FROM loans WHERE id = $1 AND user_id = $2 RETURNING id;`;
    const result = await pool.query(query, [loanId, userId]);
    return result.rows[0];
};

const updateLoanDB = async (id, userId, debtorName, totalAmount, type) => {
    const query = `
        UPDATE loans 
        SET debtor_name = $1, total_amount = $2, type = $3 
        WHERE id = $4 AND user_id = $5 
        RETURNING *;
    `;
    const result = await pool.query(query, [debtorName, totalAmount, type, id, userId]);
    return result.rows[0];
};

module.exports = { getLoansDB, createLoanDB, payLoanDB, deleteLoanDB, updateLoanDB };
// models/categoryModel.js
const pool = require('../config/db');

// Obtener todas las categorías ACTIVAS de un usuario
const getCategoriesByUserDB = async (userId) => {
    const query = `
        SELECT id, name, type, color, icon 
        FROM categories 
        WHERE user_id = $1 AND is_active = TRUE
        ORDER BY type, name ASC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Crear una nueva categoría personalizada
const createCategoryDB = async (userId, name, type, color, icon) => {
    const query = `
        INSERT INTO categories (user_id, name, type, color, icon)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, type, color, icon;
    `;
    const result = await pool.query(query, [userId, name, type, color, icon]);
    return result.rows[0];
};

// "Borrado Lógico" (Soft Delete) de una categoría
const softDeleteCategoryDB = async (categoryId, userId) => {
    // Verificamos el user_id para que nadie pueda borrar categorías de otro usuario
    const query = `
        UPDATE categories 
        SET is_active = FALSE 
        WHERE id = $1 AND user_id = $2 
        RETURNING id, name;
    `;
    const result = await pool.query(query, [categoryId, userId]);
    return result.rows[0];
};

// Crear categorías predeterminadas para un nuevo usuario
const createDefaultCategoriesDB = async (userId) => {
    // Usamos $1 repetidamente porque el ID del usuario es el mismo para las 5 categorías
    const query = `
        INSERT INTO categories (user_id, name, type, color, icon) VALUES 
        ($1, 'Sueldo', 'INCOME', '#2ecc71', 'cash-outline'),
        ($1, 'Mercado', 'EXPENSE', '#e74c3c', 'cart-outline'),
        ($1, 'Transporte', 'EXPENSE', '#f1c40f', 'bus-outline'),
        ($1, 'Servicios', 'EXPENSE', '#3498db', 'flash-outline'),
        ($1, 'Entretenimiento', 'EXPENSE', '#9b59b6', 'game-controller-outline');
    `;
    await pool.query(query, [userId]);
};

module.exports = {
    getCategoriesByUserDB,
    createCategoryDB,
    softDeleteCategoryDB,
    createDefaultCategoriesDB,
};
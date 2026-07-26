// models/userModel.js
const pool = require("../config/db");

// Función para buscar un usuario por su correo
const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

// Función para insertar un nuevo usuario
const createUser = async (name, email, hashedPassword) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, hashedPassword],
  );
  return result.rows[0];
};

const updateUserDB = async (id, name, email) => {
    const query = `
        UPDATE users 
        SET name = $1, email = $2 
        WHERE id = $3 
        RETURNING id, name, email, created_at;
    `;
    const result = await pool.query(query, [name, email, id]);
    return result.rows[0];
};

const getUserByEmailDB = async (email) => {
    const query = `
        SELECT * 
        FROM users 
        WHERE email = $1;
    `;
    const result = await pool.query(query, [email]);
    
    // Retorna el objeto del usuario si lo encuentra, o undefined si no existe
    return result.rows[0]; 
};

// 2. Buscar usuario por su ID (Necesario para el resetPassword)
const getUserByIdDB = async (id) => {
    const query = `
        SELECT * 
        FROM users 
        WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updatePasswordDB = async (userId, newPasswordHash) => {
    const query = `
        UPDATE users 
        SET password_hash = $1 
        WHERE id = $2 
        RETURNING id;
    `;
    const result = await pool.query(query, [newPasswordHash, userId]);
    return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUserDB,
  getUserByEmailDB,
  getUserByIdDB,
  updatePasswordDB,
};

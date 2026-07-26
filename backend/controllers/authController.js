// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser, updateUserDB, getUserByEmailDB, getUserByIdDB, updatePasswordDB } = require("../models/userModel");
const { createDefaultCategoriesDB } = require('../models/categoryModel');

// REGISTRO DE USUARIO
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. VALIDACIÓN
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // 2. Verificar existencia
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
        }

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Guardar usuario en PostgreSQL
        const newUser = await createUser(name, email, hashedPassword);

        // 5. Crear las categorías por defecto ---
        await createDefaultCategoriesDB(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Se han creado las categorías por defecto.',
            user: newUser
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// INICIO DE SESIÓN (LOGIN)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDACIÓN
    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Correo y contraseña son obligatorios",
        });
    }

    // 2. Buscar usuario usando el MODELO
    const user = await findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });
    }

    // 3. Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });
    }

    // 4. Generar Token JWT (15 días)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'El nombre y el correo son obligatorios.' });
        }

        const updatedUser = await updateUserDB(userId, name, email);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Perfil actualizado correctamente.',
            data: updatedUser 
        });
    } catch (error) {
        console.error('🔥 ERROR AL ACTUALIZAR PERFIL:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// Función para solicitar el reseteo de contraseña
const resetPasswordDirect = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Correo y nueva contraseña son obligatorios.' });
        }

        const user = await getUserByEmailDB(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'No existe una cuenta con ese correo.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        
        await updatePasswordDB(user.id, newHash);

        res.status(200).json({ success: true, message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error('🔥 ERROR AL CAMBIAR CONTRASEÑA:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, resetPasswordDirect };

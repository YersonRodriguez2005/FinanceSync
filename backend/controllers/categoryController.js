// controllers/categoryController.js
const {
  getCategoriesByUserDB,
  createCategoryDB,
  softDeleteCategoryDB,
} = require("../models/categoryModel");

// --- OBTENER CATEGORÍAS ---
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await getCategoriesByUserDB(userId);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

// --- CREAR CATEGORÍA ---
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, color, icon } = req.body;

    // Validación
    if (!name || !type || !color || !icon) {
      return res.status(400).json({
        success: false,
        message:
          "Nombre, tipo (INCOME/EXPENSE), color e ícono son obligatorios.",
      });
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return res.status(400).json({
        success: false,
        message: "El tipo debe ser INCOME o EXPENSE exclusivamente.",
      });
    }

    const newCategory = await createCategoryDB(userId, name, type, color, icon);

    res.status(201).json({
      success: true,
      message: "Categoría creada con éxito",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al guardar la categoría." });
  }
};

// --- ELIMINAR CATEGORÍA (Soft Delete) ---
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const deletedCategory = await softDeleteCategoryDB(categoryId, userId);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message:
          "Categoría no encontrada o no tienes permisos para eliminarla.",
      });
    }

    res.status(200).json({
      success: true,
      message: `La categoría '${deletedCategory.name}' ha sido eliminada.`,
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al intentar eliminar." });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};

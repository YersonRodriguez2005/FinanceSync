// controllers/dashboardController.js
const {
  getMonthlySummaryDB,
  getExpensesByCategoryDB,
  getDailyTrendDB
} = require("../models/dashboardModel");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtenemos mes y año de la URL con valores por defecto integrados de forma limpia
    const today = new Date();
    const month = req.query.month ? parseInt(req.query.month) : today.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : today.getFullYear();

    // Ejecutamos las tres consultas en paralelo usando Promise.all para máxima velocidad
    const [summary, expensesByCategory, trendData] = await Promise.all([
      getMonthlySummaryDB(userId, month, year),
      getExpensesByCategoryDB(userId, month, year),
      getDailyTrendDB(userId, month, year)
    ]);

    // PostgreSQL devuelve los SUM como cadenas de texto (strings) para no perder precisión. Aseguramos conversión numérica.
    const totalIncome = parseFloat(summary?.total_income || 0);
    const totalExpense = parseFloat(summary?.total_expense || 0);
    const balance = totalIncome - totalExpense;

    // Formateamos la respuesta final unificada para el frontend de FinanceSync
    res.status(200).json({
      success: true,
      period: { month, year },
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
      },
      chart_data: expensesByCategory.map((cat) => ({
        ...cat,
        total: parseFloat(cat.total || 0),
      })),
      trend_data: trendData.map((day) => ({
        ...day,
        amount: parseFloat(day.amount || 0) // Formateamos el monto diario si viene de un SUM o COUNT
      }))
    });
  } catch (error) {
    console.error("🔥 ERROR EN DASHBOARD:", error);
    res.status(500).json({
      success: false,
      message: "Error al calcular la analítica del dashboard.",
    });
  }
};

module.exports = { getDashboardData };

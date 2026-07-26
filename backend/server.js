// Importación de dependencias
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const loanRoutes = require('./routes/loanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const startCronJobs = require('./utils/cronJobs');

// Inicializar la aplicación
const app = express();

// --- Middlewares Globales ---
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Manejo de Rutas No Encontradas (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 4000;

// Iniciar los trabajos programados
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

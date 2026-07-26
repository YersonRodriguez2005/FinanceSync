// backend/controllers/reportController.js
const PDFDocument = require("pdfkit");
const pool = require("../config/db");
const { getTransactionsForReportDB } = require("../models/reportModel");
const { getMonthlySummaryDB } = require("../models/dashboardModel");

// --- PALETA DE COLORES (Diseño moderno) ---
const COLORS = {
  navy: "#0F172A",
  navyLight: "#1E293B",
  mint: "#00D09C",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  success: "#10B981",
  successBg: "#ECFDF5",
  danger: "#F43F5E",
  dangerBg: "#FEF2F2",
};

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495; // A4 (595.28pt) - 2*50 de margen

const formatCurrency = (value) =>
  `$${Math.abs(value).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;

// --- ICONO DE TENDENCIA (círculo + flecha) ---
function drawTrendIcon(doc, x, y, isPositive) {
  const bg = isPositive ? COLORS.successBg : COLORS.dangerBg;
  const fg = isPositive ? COLORS.success : COLORS.danger;
  doc.circle(x + 12, y + 12, 12).fill(bg);
  if (isPositive) {
    doc.polygon([x + 12, y + 7], [x + 18, y + 16], [x + 6, y + 16]).fill(fg);
  } else {
    doc.polygon([x + 12, y + 17], [x + 18, y + 8], [x + 6, y + 8]).fill(fg);
  }
}

// --- ENCABEZADO PRINCIPAL ---
function drawMainHeader(doc, userName, month, year) {
  const pageWidth = doc.page.width;

  const gradient = doc.linearGradient(0, 0, pageWidth, 130);
  gradient.stop(0, COLORS.navy).stop(1, COLORS.navyLight);
  doc.rect(0, 0, pageWidth, 130).fill(gradient);
  doc.rect(0, 127, pageWidth, 3).fill(COLORS.mint);

  doc
    .fillColor(COLORS.mint)
    .font("Helvetica-Bold")
    .fontSize(26)
    .text("FinanceSync", PAGE_MARGIN, 38);

  doc
    .fillColor(COLORS.gray400)
    .font("Helvetica")
    .fontSize(9)
    .text("Gestión financiera inteligente", PAGE_MARGIN, 68);

  const monthName = MONTHS_ES[parseInt(month, 10) - 1] || `Mes ${month}`;

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Extracto Mensual", 300, 38, { width: 245, align: "right" });

  doc
    .fillColor(COLORS.gray400)
    .font("Helvetica")
    .fontSize(9)
    .text(`${monthName} ${year}`, 300, 56, { width: 245, align: "right" })
    .text(userName, 300, 70, { width: 245, align: "right" });
}

// --- ENCABEZADO DE PÁGINAS ADICIONALES ---
function drawContinuationHeader(doc) {
  doc.rect(0, 0, doc.page.width, 50).fill(COLORS.navy);
  doc
    .fillColor(COLORS.mint)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("FinanceSync", PAGE_MARGIN, 17);
  doc
    .fillColor(COLORS.gray400)
    .font("Helvetica")
    .fontSize(9)
    .text("Historial de Movimientos (continuación)", 300, 20, {
      width: 245,
      align: "right",
    });
}

// --- TARJETAS DE RESUMEN ---
function drawSummaryCards(doc, balance, totalIncome, totalExpense) {
  const startY = 150;
  const cardWidth = 155;
  const cardHeight = 90;
  const gap = 15;

  const cards = [
    { label: "Balance Total", value: balance, positive: balance >= 0, isBalance: true },
    { label: "Total Ingresos", value: totalIncome, positive: true },
    { label: "Total Gastos", value: totalExpense, positive: false },
  ];

  cards.forEach((card, i) => {
    const x = PAGE_MARGIN + i * (cardWidth + gap);

    doc.roundedRect(x, startY, cardWidth, cardHeight, 8).fill(COLORS.gray50);
    doc
      .roundedRect(x, startY, cardWidth, cardHeight, 8)
      .lineWidth(1)
      .stroke(COLORS.gray200);

    drawTrendIcon(doc, x + 15, startY + 15, card.positive);

    doc
      .fillColor(COLORS.gray500)
      .font("Helvetica")
      .fontSize(9)
      .text(card.label, x + 15, startY + 48);

    const amountColor = card.positive ? COLORS.success : COLORS.danger;
    const sign = card.isBalance ? (card.positive ? "" : "-") : card.positive ? "+" : "-";

    doc
      .fillColor(amountColor)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(`${sign}${formatCurrency(card.value)}`, x + 15, startY + 62, {
        width: cardWidth - 30,
      });
  });

  return startY + cardHeight + 30;
}

// --- CABECERA DE TABLA ---
function drawTableHeader(doc, y) {
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 28, 4).fill(COLORS.navy);

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(9);
  doc.text("FECHA", 65, y + 10);
  doc.text("CATEGORÍA", 155, y + 10);
  doc.text("DESCRIPCIÓN", 280, y + 10);
  doc.text("MONTO", 400, y + 10, { width: 130, align: "right" });

  return y + 28;
}

// --- FILA DE TRANSACCIÓN ---
function drawTransactionRow(doc, t, y, index) {
  const rowHeight = 26;

  if (index % 2 === 0) {
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowHeight).fill(COLORS.gray50);
  }

  const dateStr = new Date(t.date).toLocaleDateString("es-CO");
  const isIncome = t.type === "INCOME";
  const sign = isIncome ? "+" : "-";

  doc
    .fillColor(COLORS.gray700)
    .font("Helvetica")
    .fontSize(9)
    .text(dateStr, 65, y + 8);

  // Badge de categoría
  const categoryText = t.category_name || "Sin categoría";
  doc.font("Helvetica").fontSize(8);
  const badgeWidth = Math.min(100, doc.widthOfString(categoryText) + 16);

  doc
    .roundedRect(155, y + 5, badgeWidth, 16, 8)
    .fill(isIncome ? COLORS.successBg : COLORS.gray100);
  doc
    .fillColor(isIncome ? COLORS.success : COLORS.gray700)
    .text(categoryText, 155, y + 9, { width: badgeWidth, align: "center" });

  doc
    .fillColor(COLORS.gray500)
    .font("Helvetica")
    .fontSize(9)
    .text(t.description || "-", 280, y + 8, {
      width: 110,
      height: 14,
      ellipsis: true,
      lineBreak: false,
    });

  doc
    .fillColor(isIncome ? COLORS.success : COLORS.navy)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(`${sign}${formatCurrency(t.amount)}`, 400, y + 7, {
      width: 130,
      align: "right",
    });
}

// --- PIE DE PÁGINA ---
function drawFooter(doc, pageNumber, totalPages) {
  const y = doc.page.height - 45;

  doc
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y)
    .strokeColor(COLORS.gray200)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(COLORS.gray400)
    .font("Helvetica")
    .fontSize(8)
    .text("Documento generado automáticamente por FinanceSync App", PAGE_MARGIN, y + 10, {
      width: 300,
    });

  doc
    .fillColor(COLORS.gray400)
    .fontSize(8)
    .text(`Página ${pageNumber} de ${totalPages}`, 350, y + 10, {
      width: 195,
      align: "right",
    });
}

// --- CONTROLADOR PRINCIPAL ---
const generatePdfExtract = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const userQuery = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const userName = userQuery.rows[0]?.name || "Usuario";

    const [transactions, summary] = await Promise.all([
      getTransactionsForReportDB(userId, month, year),
      getMonthlySummaryDB(userId, month, year),
    ]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FinanceSync_Extracto_${month}_${year}.pdf`,
    );

    // bufferPages permite volver a cada página al final para numerarlas
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", bufferPages: true });
    doc.pipe(res);

    // --- 1. ENCABEZADO ---
    drawMainHeader(doc, userName, month, year);

    // --- 2. TARJETAS DE RESUMEN ---
    const totalIncome = parseFloat(summary.total_income) || 0;
    const totalExpense = parseFloat(summary.total_expense) || 0;
    const balance = totalIncome - totalExpense;

    let yPosition = drawSummaryCards(doc, balance, totalIncome, totalExpense);

    // --- 3. TABLA DE TRANSACCIONES ---
    doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Historial de Movimientos", PAGE_MARGIN, yPosition);

    yPosition += 25;
    yPosition = drawTableHeader(doc, yPosition) + 4;

    if (!transactions || transactions.length === 0) {
      doc
        .fillColor(COLORS.gray400)
        .font("Helvetica")
        .fontSize(11)
        .text("No hay transacciones registradas este mes.", PAGE_MARGIN, yPosition + 20, {
          width: CONTENT_WIDTH,
          align: "center",
        });
    } else {
      transactions.forEach((t, index) => {
        if (yPosition > 740) {
          doc.addPage();
          drawContinuationHeader(doc);
          yPosition = drawTableHeader(doc, 70) + 4;
        }
        drawTransactionRow(doc, t, yPosition, index);
        yPosition += 26;
      });
    }

    // --- 4. NUMERACIÓN DE PÁGINAS Y PIE (aplicado a todas las páginas) ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawFooter(doc, i + 1, range.count);
    }

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error interno al generar el extracto.",
      });
    }
  }
};

module.exports = { generatePdfExtract };
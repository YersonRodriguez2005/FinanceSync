// utils/cronJobs.js
const cron = require("node-cron");
const pool = require("../config/db");

const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "⏰ Ejecutando tarea programada: Verificando gastos recurrentes...",
    );

    try {
      const today = new Date();
      const currentDay = today.getDate();

      // Buscamos transacciones recurrentes únicas para cobrar hoy
      const getRecurringQuery = `
                SELECT DISTINCT ON (user_id, category_id, amount) 
                    user_id, category_id, amount, description, billing_day
                FROM transactions
                WHERE is_recurring = TRUE AND billing_day = $1;
            `;

      const { rows: pendingTransactions } = await pool.query(
        getRecurringQuery,
        [currentDay],
      );

      if (pendingTransactions.length === 0) {
        console.log("✅ No hay gastos recurrentes programados para hoy.");
        return;
      }

      // Insertamos cada gasto encontrado como una transacción nueva para este mes
      for (let tx of pendingTransactions) {
        const insertQuery = `
                    INSERT INTO transactions (user_id, category_id, amount, date, description, is_recurring, billing_day)
                    VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6)
                `;
        const newDescription = tx.description
          ? `${tx.description} (Automático)`
          : "Cobro Automático";

        await pool.query(insertQuery, [
          tx.user_id,
          tx.category_id,
          tx.amount,
          newDescription,
          true,
          tx.billing_day,
        ]);
      }

      console.log(
        `✅ Se registraron ${pendingTransactions.length} gastos automáticos.`,
      );
    } catch (error) {
      console.error("❌ Error en el Cron Job:", error);
    }
  });
};

module.exports = startCronJobs;

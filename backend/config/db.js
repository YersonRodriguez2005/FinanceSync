// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('✅ Conexión a PostgreSQL establecida.');
});

pool.on('error', (err) => {
    console.error('❌ Error fatal de base de datos:', err);
    process.exit(-1);
});

module.exports = pool;
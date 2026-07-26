# 🛠️ Documento de Arquitectura y Diseño Técnico (Tech Design)
**Proyecto:** App Móvil de Finanzas Personales
**Versión:** 2.0
**Fecha:** Julio 2026

---

## 1. Arquitectura del Sistema (Visión Global)

El sistema utilizará una arquitectura Cliente-Servidor separada (Decoupled Architecture).

*   **Capa de Presentación (Frontend):** React.js + Tailwind CSS. Se empaquetará como una aplicación móvil nativa utilizando **Capacitor** (o Ionic, que permite usar React de forma nativa).
*   **Capa de Negocio (Backend API):** Node.js con Express.js. Actuará como un servidor RESTful stateless (sin estado), autenticando peticiones mediante JWT.
*   **Capa de Datos (Base de Datos):** PostgreSQL. Se utilizará **Prisma ORM** para interactuar con la base de datos de manera tipada y segura.

---

## 2. Modelado de Base de Datos (Esquema Físico)

Para manejar dinero, **nunca** usamos el tipo de dato `FLOAT` o `REAL` debido a errores de precisión en punto flotante. Utilizaremos `DECIMAL(10,2)`.

### 2.1 Tablas y Tipos de Datos Estrictos

#### Tabla: `users`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Identificador único del usuario |
| `name` | VARCHAR(100) | NOT NULL | Nombre completo |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Correo para login |
| `password_hash` | VARCHAR(255) | NOT NULL | Contraseña encriptada (bcrypt) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |

#### Tabla: `categories`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Identificador de categoría |
| `user_id` | UUID | FOREIGN KEY (users.id) | Dueño de la categoría |
| `name` | VARCHAR(50) | NOT NULL | Ej. "Mercado", "Suscripciones" |
| `type` | ENUM | 'INCOME', 'EXPENSE' | Tipo de categoría |
| `color` | VARCHAR(7) | NOT NULL | Código Hex (ej. #FF5733) |
| `icon` | VARCHAR(50) | NOT NULL | Nombre del ícono (ej. 'home-outline') |

#### Tabla: `transactions`
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID de la transacción |
| `user_id` | UUID | FOREIGN KEY (users.id) | Dueño de la transacción |
| `category_id` | UUID | FOREIGN KEY (categories.id)| Relación con categoría |
| `amount` | DECIMAL(10,2)| NOT NULL | Valor del movimiento |
| `date` | DATE | NOT NULL | Fecha en que ocurrió |
| `description` | TEXT | NULLABLE | Nota opcional |
| `is_recurring` | BOOLEAN | DEFAULT FALSE | ¿Es un gasto fijo mensual? |
| `billing_day` | INTEGER | CHECK (1-31), NULL | Día del mes para cobro automático |

#### Tabla: `savings_goals` (Metas de Ahorro)
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID de la meta |
| `user_id` | UUID | FOREIGN KEY (users.id) | Dueño de la meta |
| `name` | VARCHAR(100) | NOT NULL | Ej. "Viaje a la playa" |
| `target_amount` | DECIMAL(10,2)| NOT NULL | Cuánto se quiere ahorrar |
| `current_amount`| DECIMAL(10,2)| DEFAULT 0.00 | Cuánto se ha ahorrado |
| `deadline` | DATE | NULLABLE | Fecha límite para cumplirlo |

#### Tabla: `loans` (Préstamos)
| Columna | Tipo de Dato | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID del préstamo |
| `user_id` | UUID | FOREIGN KEY (users.id) | Prestamista (el usuario) |
| `debtor_name` | VARCHAR(100) | NOT NULL | A quién se le prestó |
| `total_amount` | DECIMAL(10,2)| NOT NULL | Monto total prestado |
| `amount_paid` | DECIMAL(10,2)| DEFAULT 0.00 | Cuánto han devuelto |
| `due_date` | DATE | NULLABLE | Fecha máxima de pago |
| `status` | ENUM | 'ACTIVE', 'PAID' | Estado actual |

---

## 3. Diseño de la API REST (Contratos de Endpoints)

Definición de cómo el Frontend se comunicará con el Backend. Todas las rutas bajo `/api/` (excepto auth) requieren el header: `Authorization: Bearer <token>`.

### 3.1 Ejemplo: Registrar una Transacción
*   **Ruta:** `POST /api/transactions`
*   **Body (Request):**
    ```json
    {
      "amount": 150000.00,
      "category_id": "uuid-de-la-categoria",
      "date": "2026-07-23",
      "description": "Pago factura de luz",
      "is_recurring": true,
      "billing_day": 23
    }
    ```
*   **Respuesta Exitosa (201 Created):**
    ```json
    {
      "success": true,
      "message": "Transacción registrada",
      "transaction": { "id": "nuevo-uuid", ... }
    }
    ```

### 3.2 Otros Endpoints Clave
*   `GET /api/dashboard/summary?month=07&year=2026`: Retorna el total de ingresos, gastos y balance del mes.
*   `POST /api/loans/:id/pay`: Recibe un `amount` en el body para sumar al `amount_paid` del préstamo y evalúa si cambia el `status` a 'PAID'.
*   `GET /api/reports/extract?month=07`: Dispara la generación del PDF en el servidor usando `pdfkit` y retorna un link de descarga o el buffer del archivo.

---

## 4. Arquitectura del Frontend (React)

### 4.1 Manejo de Estado (State Management)
*   **Estado del Servidor:** Utilizaremos **React Query (@tanstack/react-query)**. Esto cachea las peticiones, maneja los estados de carga (loading, error) y actualiza el Dashboard automáticamente cuando se crea una transacción.
*   **Estado Global (Local):** Utilizaremos **Zustand** para variables pequeñas como "Tema Oscuro/Claro" o "Usuario Autenticado".

### 4.2 Sistema de Diseño (Tailwind CSS)
Para lograr la estética solicitada sin comprometer el rendimiento:

*   **Glassmorphism (Clases Tailwind):** `bg-white/30 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl`.
    *   *Regla de rendimiento:* Solo aplicarlo en la tarjeta principal (Hero Card) del Dashboard y en el Bottom Navigation Bar.
*   **Soft UI / Neumorphism (Clases Tailwind):** `bg-gray-100 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] rounded-xl`.
    *   *Regla de diseño:* Usarlo en botones de acción y tarjetas de préstamos/ahorros.

### 4.3 Virtualización de Listas
Para el historial de transacciones, si un usuario tiene 500 registros en un mes, renderizar 500 nodos del DOM con sombras colapsará la memoria del celular.
*   **Solución:** Se implementará **Virtualización** (ej. usando `react-window` o `Virtuoso`). Esto significa que React solo renderizará en el DOM las 8 o 10 transacciones que son visibles en la pantalla en ese momento, reciclando los elementos al hacer scroll.
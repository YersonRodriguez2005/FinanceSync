# Especificación de Requisitos de Software (SRS)
## Basado en el estándar IEEE 830
**Proyecto:** App Móvil de Finanzas Personales - FinanceSync
**Versión:** 1.0
**Fecha:** Julio 2026

---

## 1. Introducción

### 1.1 Propósito
El propósito de este documento es definir detalladamente los requisitos funcionales y no funcionales para el desarrollo de la aplicación móvil de Finanzas Personales. Este documento servirá como base fundamental para el equipo de desarrollo (Frontend, Backend, Base de Datos) y como contrato de alcance del proyecto.

### 1.2 Alcance del Producto
El software a desarrollar es una aplicación móvil (iOS y Android) que permitirá a los usuarios gestionar su flujo de caja personal. El sistema incluirá la categorización de ingresos y gastos, configuración de pagos recurrentes automatizados, gestión de metas de ahorro, control de préstamos a terceros y generación de extractos en PDF. Estará construido con una arquitectura Cliente-Servidor usando React (con empaquetado móvil), Node.js/Express y PostgreSQL.

### 1.3 Definiciones, Acrónimos y Abreviaturas
*   **API:** Interfaz de Programación de Aplicaciones.
*   **JWT:** JSON Web Token (usado para autenticación).
*   **ACID:** Atomicidad, Consistencia, Aislamiento, Durabilidad (propiedades de transacciones en bases de datos relacionales).
*   **Glassmorphism / Soft UI:** Patrones de diseño de interfaces de usuario.
*   **Recurrencia:** Acción repetitiva programada automáticamente por el sistema.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema opera de forma independiente y consta de dos componentes principales:
1.  **Frontend Móvil:** Interfaz gráfica de usuario con la que interactúa el cliente.
2.  **Backend (API RESTful):** Servidor centralizado que procesa la lógica de negocio, se conecta a la base de datos PostgreSQL y sirve los datos al cliente.

### 2.2 Características de los Usuarios
*   **Usuario Final:** Persona natural con conocimientos básicos en el uso de smartphones, que desea organizar sus finanzas. No requiere conocimientos contables avanzados.

### 2.3 Restricciones de Diseño y Construcción
*   El backend debe desarrollarse estrictamente en Node.js utilizando el framework Express.
*   La persistencia de datos debe realizarse en PostgreSQL.
*   El diseño de la UI debe implementar Glassmorphism y Soft UI, pero manteniendo estrictamente 60 FPS en el renderizado móvil.
*   Cualquier cálculo monetario debe manejarse con precisión decimal adecuada para evitar errores de redondeo.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (RF)

#### Módulo 1: Autenticación y Gestión de Usuarios
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-1.1** | Registro de Usuario | El sistema debe permitir a un usuario registrarse usando nombre, correo electrónico y contraseña. |
| **RF-1.2** | Autenticación | El sistema debe permitir el inicio de sesión validando credenciales y retornando un token de sesión (JWT). |
| **RF-1.3** | Recuperación | El sistema debe permitir recuperar la contraseña mediante un enlace enviado al correo electrónico. |

#### Módulo 2: Gestión de Transacciones (Ingresos y Gastos)
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-2.1** | Registrar Transacción | El usuario debe poder registrar un ingreso o gasto indicando: Monto, Fecha, Categoría, Descripción (Opcional) y Tipo (Fijo/Variable). |
| **RF-2.2** | Editar/Eliminar | El usuario puede modificar o eliminar una transacción existente. El sistema recalculará los saldos automáticamente. |
| **RF-2.3** | Categorías Personalizadas | El sistema debe incluir categorías por defecto (Servicios, Mercado, etc.), pero permitir al usuario crear, editar color/ícono, y eliminar categorías propias. |

#### Módulo 3: Automatización de Gastos Recurrentes
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-3.1** | Configurar Recurrencia | Al crear un gasto, el usuario puede marcarlo como "Recurrente". |
| **RF-3.2** | Programación de Fecha | El usuario debe poder seleccionar el día exacto de cobro (ej. "Día 1 de cada mes" o "Día 15 de cada mes"). |
| **RF-3.3** | Ejecución Automática | El sistema (mediante un Cron Job en el servidor) debe registrar automáticamente la transacción en la fecha estipulada sin intervención del usuario. |

#### Módulo 4: Gestión de Presupuestos y Ahorros
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-4.1** | Crear Meta | El usuario debe poder crear un fondo de ahorro definiendo: Nombre de la meta, Monto Objetivo y Fecha Límite. |
| **RF-4.2** | Registrar Aportes | El usuario podrá registrar transferencias de su saldo general hacia la meta de ahorro seleccionada. |
| **RF-4.3** | Visualizar Progreso | El sistema debe mostrar el porcentaje de cumplimiento mediante una representación visual (ej. barra de progreso). |

#### Módulo 5: Gestión de Préstamos
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-5.1** | Registrar Préstamo | El usuario debe poder registrar un préstamo indicando: Nombre del deudor, Monto, Fecha límite de pago o "Fecha indefinida". |
| **RF-5.2** | Registrar Pagos | El sistema debe permitir registrar abonos parciales o la liquidación total de la deuda. |
| **RF-5.3** | Estado del Préstamo | El sistema actualizará el estado del préstamo ("Activo" o "Pagado") según el saldo restante. |

#### Módulo 6: Dashboard y Analítica
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-6.1** | Balance General | El sistema debe calcular y mostrar el saldo total actual, ingresos del mes y gastos del mes. |
| **RF-6.2** | Gráficos Visuales | El sistema debe renderizar gráficos (dona/pastel) para distribuir los gastos por categoría en el mes seleccionado. |

#### Módulo 7: Generación de Extractos
| ID | Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-7.1** | Generar Reporte | El sistema debe permitir al usuario seleccionar un mes/año y generar un reporte detallado. |
| **RF-7.2** | Descarga en PDF | El reporte debe ser descargable en formato PDF, conteniendo el resumen mensual y el listado de todas las transacciones. |

---

## 4. Requisitos de Interfaz Externa

### 4.1 Interfaz de Usuario (UI)
*   La aplicación debe diseñarse siguiendo el principio *Mobile-First*.
*   Los elementos flotantes o superpuestos deben aplicar el estilo *Glassmorphism* usando `backdrop-filter: blur()`.
*   Las tarjetas (Cards) de métricas y formularios deben implementar *Soft UI* (sombras interiores y exteriores sutiles).

### 4.2 Interfaces de Software
*   El Frontend se comunicará con el Backend exclusivamente a través de la API REST utilizando el formato JSON.

---

## 5. Requisitos No Funcionales (Atributos de Calidad)

### 5.1 Rendimiento
*   El tiempo de respuesta de cualquier endpoint de la API no debe superar los 300ms en condiciones normales de red.
*   El renderizado en la aplicación móvil debe mantenerse fluido (60 FPS). Las animaciones pesadas se limitarán a interacciones clave.

### 5.2 Seguridad
*   Las contraseñas de los usuarios deben ser hasheadas usando un algoritmo seguro (ej. bcrypt) antes de ser almacenadas en PostgreSQL.
*   Todas las rutas de la API (excepto login y registro) deben requerir un token JWT válido enviado en el header `Authorization`.

### 5.3 Fiabilidad e Integridad de Datos
*   Todas las operaciones financieras (ej. transferir dinero a un ahorro) deben envolverse en **Transacciones de Base de Datos (Transactions ACID)** para evitar estados inconsistentes si el servidor falla a mitad de la operación.
// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // 1. Buscar el token en las cabeceras HTTP
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Separamos la palabra "Bearer" del token real usando un espacio
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Si el usuario no envió ningún token, lo rebotamos inmediatamente
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. No se proporcionó un token de autenticación.",
    });
  }

  try {
    // 3. Verificar el Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Inyectar los datos del usuario en la petición (req)
    req.user = decoded;

    // 5. Dar permiso para continuar al controlador
    next();
  } catch (error) {
    console.error("Error de validación de token:", error.message);

    // Podemos enviar un mensaje específico si expiró
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Tu sesión de 15 días ha expirado. Por favor, inicia sesión nuevamente.",
        });
    }

    return res.status(401).json({ success: false, message: "Token inválido." });
  }
};

module.exports = { protect };

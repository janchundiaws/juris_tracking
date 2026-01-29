const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_change_in_production';

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Esperamos: Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación' });
  }
};

/**
 * Generar un token JWT
 * @param {Object} payload - Datos a codificar en el token
 * @param {String} expiresIn - Tiempo de expiración (ej: '1h', '7d')
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  verifyToken,
  generateToken,
  JWT_SECRET
};

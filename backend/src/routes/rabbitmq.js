const express = require('express');
const router = express.Router();
const { getMensajesRecibidos, limpiarMensajes } = require('../consumers/userConsumer');

/**
 * @swagger
 * /api/rabbitmq/mensajes:
 *   get:
 *     summary: Obtener mensajes recibidos de RabbitMQ
 *     tags:
 *       - RabbitMQ
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de mensajes a retornar
 *     responses:
 *       200:
 *         description: Lista de mensajes recibidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 mensajes:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/mensajes', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const mensajes = getMensajesRecibidos();
    
    res.json({
      total: mensajes.length,
      limit: limit,
      mensajes: mensajes.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/rabbitmq/mensajes/stats:
 *   get:
 *     summary: Obtener estadísticas de mensajes recibidos
 *     tags:
 *       - RabbitMQ
 *     responses:
 *       200:
 *         description: Estadísticas de mensajes
 */
router.get('/mensajes/stats', (req, res) => {
  try {
    const mensajes = getMensajesRecibidos();
    
    // Contar por tipo de evento
    const stats = mensajes.reduce((acc, msg) => {
      acc[msg.event] = (acc[msg.event] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: mensajes.length,
      eventos: stats,
      ultimoMensaje: mensajes[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/rabbitmq/mensajes:
 *   delete:
 *     summary: Limpiar mensajes almacenados
 *     tags:
 *       - RabbitMQ
 *     responses:
 *       200:
 *         description: Mensajes limpiados exitosamente
 */
router.delete('/mensajes', (req, res) => {
  try {
    limpiarMensajes();
    res.json({ message: 'Mensajes limpiados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/rabbitmq/health:
 *   get:
 *     summary: Verificar estado de conexión a RabbitMQ
 *     tags:
 *       - RabbitMQ
 *     responses:
 *       200:
 *         description: Estado de la conexión
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'connected',
    consumer: 'running',
    queue: 'usuarios_queue'
  });
});

module.exports = router;

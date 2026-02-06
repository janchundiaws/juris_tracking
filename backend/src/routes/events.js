const express = require('express');
const router = express.Router();
const Event = require('../models/Events');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *       401:
 *         description: No autorizado
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name', 'email']
      }],
      order: [['event_date', 'ASC']],
      tenantId: req.tenantId
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/events/user/{userId}:
 *   get:
 *     summary: Obtener eventos de un usuario específico
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de eventos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { user_id: req.params.userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name', 'email']
      }],
      order: [['event_date', 'ASC']],
      tenantId: req.tenantId
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Obtener un evento por ID
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos del evento
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name', 'email']
      }],
      tenantId: req.tenantId
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               event_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *             required:
 *               - user_id
 *               - event_date
 *               - description
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { user_id, event_date, description, location } = req.body;

    if (!user_id || !event_date || !description) {
      return res.status(400).json({ 
        error: 'Los campos user_id, event_date y description son requeridos' 
      });
    }

    // Verificar que el usuario existe en el tenant
    const user = await User.findByPk(user_id, { tenantId: req.tenantId });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const event = await Event.create({
      tenant_id: req.tenantId,
      user_id,
      event_date,
      description,
      location
    });

    const eventWithUser = await Event.findByPk(event.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name', 'email']
      }]
    });

    res.status(201).json({
      message: 'Evento creado exitosamente',
      event: eventWithUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Actualizar un evento
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, { tenantId: req.tenantId });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const { event_date, description, location } = req.body;

    await event.update({
      event_date: event_date || event.event_date,
      description: description || event.description,
      location: location !== undefined ? location : event.location
    });

    const updatedEvent = await Event.findByPk(event.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'first_name', 'last_name', 'email']
      }]
    });

    res.json({
      message: 'Evento actualizado exitosamente',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Eliminar un evento
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, { tenantId: req.tenantId });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await event.destroy();

    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

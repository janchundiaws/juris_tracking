const express = require('express');
const router = express.Router();
const Activity = require('../models/Activities');
const JudicialProcess = require('../models/JudicialProcess');
const Lawyer = require('../models/Lawyer');
const { verifyToken } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Obtener todas las actividades
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: judicial_process_id
 *         schema:
 *           type: string
 *         description: Filtrar actividades por ID de proceso judicial
 *       - in: query
 *         name: activity_type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de actividad
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filtrar por abogado asignado
 *     responses:
 *       200:
 *         description: Lista de actividades
 *       500:
 *         description: Error del servidor
 */
router.get('/',tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const { judicial_process_id, activity_type, priority, assigned_to } = req.query;
    const whereClause = {};

    whereClause.tenant_id = req.tenantId; // Asegurar que solo se obtengan actividades del tenant actual
    
    if (judicial_process_id) {
      whereClause.judicial_process_id = judicial_process_id;
    }
    
    if (activity_type) {
      whereClause.activity_type = activity_type;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }
    
    if (assigned_to) {
      whereClause.assigned_to = assigned_to;
    }

    const activities = await Activity.findAll({
      where: whereClause,
      include: [
        {
          model: JudicialProcess,
          as: 'judicial_process',
          attributes: ['id', 'case_number', 'process_type', 'full_name', 'status']
        },
        {
          model: Lawyer,
          as: 'assigned_lawyer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ],
      order: [['probable_activity_date', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/activities/process/{judicial_process_id}:
 *   get:
 *     summary: Obtener todas las actividades de un proceso judicial específico
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: judicial_process_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proceso judicial
 *     responses:
 *       200:
 *         description: Lista de actividades del proceso judicial
 *       500:
 *         description: Error del servidor
 */
router.get('/process/:judicial_process_id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const { judicial_process_id } = req.params;

    const activities = await Activity.findAll({
      where: { judicial_process_id, tenant_id: req.tenantId },
      include: [
        {
          model: JudicialProcess,
          as: 'judicial_process',
          attributes: ['id', 'case_number', 'process_type', 'full_name', 'status']
        },
        {
          model: Lawyer,
          as: 'assigned_lawyer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ],
      order: [['probable_activity_date', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Obtener una actividad por ID
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Detalles de la actividad
 *       404:
 *         description: Actividad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId },
      include: [
        {
          model: JudicialProcess,
          as: 'judicial_process',
          attributes: ['id', 'case_number', 'process_type', 'full_name', 'status']
        },
        {
          model: Lawyer,
          as: 'assigned_lawyer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Crear una nueva actividad
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - judicial_process_id
 *               - activity_type
 *             properties:
 *               judicial_process_id:
 *                 type: string
 *               activity_type:
 *                 type: string
 *                 enum: [audiencia, diligencia, presentacion, notificacion, reunion, otro]
 *               probable_activity_date:
 *                 type: string
 *                 format: date-time
 *               completed_date:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [baja, media, alta, urgente]
 *               assigned_to:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Actividad creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const {
      judicial_process_id,
      activity_type,
      probable_activity_date,
      completed_date,
      priority,
      assigned_to,
      notes
    } = req.body;

    // Validar campos requeridos
    if (!judicial_process_id || !activity_type) {
      return res.status(400).json({ 
        error: 'judicial_process_id y activity_type son requeridos' 
      });
    }

    // Validar que el tipo de actividad sea válido
    const validTypes = ['audiencia', 'diligencia', 'presentacion', 'notificacion', 'reunion', 'otro'];
    if (!validTypes.includes(activity_type)) {
      return res.status(400).json({ 
        error: `activity_type debe ser uno de: ${validTypes.join(', ')}` 
      });
    }

    // Validar que la prioridad sea válida (si se proporciona)
    if (priority) {
      const validPriorities = ['baja', 'media', 'alta', 'urgente'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
          error: `priority debe ser uno de: ${validPriorities.join(', ')}` 
        });
      }
    }

    const activity = await Activity.create({
      judicial_process_id,
      activity_type,
      probable_activity_date,
      completed_date,
      priority: priority || 'media',
      assigned_to,
      notes,
      tenant_id: req.tenantId,
    });

    res.status(201).json({
      message: 'Actividad creada exitosamente',
      activity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Actualizar una actividad existente
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_type:
 *                 type: string
 *                 enum: [audiencia, diligencia, presentacion, notificacion, reunion, otro]
 *               probable_activity_date:
 *                 type: string
 *                 format: date-time
 *               completed_date:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [baja, media, alta, urgente]
 *               assigned_to:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Actividad actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Actividad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    const {
      activity_type,
      probable_activity_date,
      completed_date,
      priority,
      assigned_to,
      notes
    } = req.body;

    // Validar tipo de actividad si se proporciona
    if (activity_type) {
      const validTypes = ['audiencia', 'diligencia', 'presentacion', 'notificacion', 'reunion', 'otro'];
      if (!validTypes.includes(activity_type)) {
        return res.status(400).json({ 
          error: `activity_type debe ser uno de: ${validTypes.join(', ')}` 
        });
      }
    }

    // Validar prioridad si se proporciona
    if (priority) {
      const validPriorities = ['baja', 'media', 'alta', 'urgente'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
          error: `priority debe ser uno de: ${validPriorities.join(', ')}` 
        });
      }
    }

    await activity.update({
      activity_type: activity_type || activity.activity_type,
      probable_activity_date: probable_activity_date !== undefined ? probable_activity_date : activity.probable_activity_date,
      completed_date: completed_date !== undefined ? completed_date : activity.completed_date,
      priority: priority || activity.priority,
      assigned_to: assigned_to !== undefined ? assigned_to : activity.assigned_to,
      notes: notes !== undefined ? notes : activity.notes,
      tenant_id: req.tenantId
    });

    res.json({
      message: 'Actividad actualizada exitosamente',
      activity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Eliminar una actividad
 *     tags:
 *       - Actividades
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad eliminada exitosamente
 *       404:
 *         description: Actividad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    await activity.destroy();

    res.json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

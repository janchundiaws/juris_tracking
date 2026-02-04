const express = require('express');
const router = express.Router();
const JudicialProcess = require('../models/JudicialProcess');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/judicial-processes:
 *   get:
 *     summary: Obtener todos los procesos judiciales
 *     tags:
 *       - Procesos Judiciales
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de procesos judiciales
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const processes = await JudicialProcess.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/judicial-processes/{id}:
 *   get:
 *     summary: Obtener un proceso judicial por ID
 *     tags:
 *       - Procesos Judiciales
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del proceso judicial
 *       404:
 *         description: Proceso no encontrado
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const process = await JudicialProcess.findByPk(req.params.id);

    if (!process) {
      return res.status(404).json({ error: 'Proceso judicial no encontrado' });
    }

    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/judicial-processes:
 *   post:
 *     summary: Crear un nuevo proceso judicial
 *     tags:
 *       - Procesos Judiciales
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               internal_lawyer_id:
 *                 type: string
 *                 format: uuid
 *               external_lawyer_id:
 *                 type: string
 *                 format: uuid
 *               provincie_id:
 *                 type: string
 *                 format: uuid
 *               creditor_id:
 *                 type: string
 *                 format: uuid
 *               product:
 *                 type: string
 *                 format: uuid
 *               guarantee:
 *                 type: string
 *                 format: uuid
 *               identification:
 *                 type: string
 *               full_name:
 *                 type: string
 *               operation:
 *                 type: string
 *               area_assignment_date:
 *                 type: string
 *                 format: date
 *               internal_assignment_date:
 *                 type: string
 *                 format: date
 *               external_assignment_date:
 *                 type: string
 *                 format: date
 *               process_type:
 *                 type: string
 *               case_number:
 *                 type: string
 *               procedural_summary:
 *                 type: string
 *               procedural_progress:
 *                 type: string
 *               demand_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *             required:
 *               - identification
 *               - full_name
 *               - process_type
 *               - status
 *     responses:
 *       201:
 *         description: Proceso judicial creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { identification, full_name, process_type, status, case_number } = req.body;

    if (!identification || !full_name || !process_type || !status) {
      return res.status(400).json({ 
        error: 'Los campos identification, full_name, process_type y status son requeridos' 
      });
    }

    // Verificar si el número de caso ya existe
    if (case_number) {
      const existingProcess = await JudicialProcess.findOne({
        where: { case_number }
      });

      if (existingProcess) {
        return res.status(400).json({
          error: 'El número de caso ya está registrado. Este caso ya fue creado anteriormente.'
        });
      }
    }

    const process = await JudicialProcess.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Proceso judicial creado exitosamente',
      process
    });
  } catch (error) {
    // Capturar error de constraint único por si acaso
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'El número de caso ya está registrado. Este caso ya fue creado anteriormente.'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/judicial-processes/{id}:
 *   put:
 *     summary: Actualizar un proceso judicial
 *     tags:
 *       - Procesos Judiciales
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               internal_lawyer_id:
 *                 type: string
 *                 format: uuid
 *               external_lawyer_id:
 *                 type: string
 *                 format: uuid
 *               provincie_id:
 *                 type: string
 *                 format: uuid
 *               creditor_id:
 *                 type: string
 *                 format: uuid
 *               product:
 *                 type: string
 *                 format: uuid
 *               guarantee:
 *                 type: string
 *                 format: uuid
 *               identification:
 *                 type: string
 *               full_name:
 *                 type: string
 *               operation:
 *                 type: string
 *               area_assignment_date:
 *                 type: string
 *                 format: date
 *               internal_assignment_date:
 *                 type: string
 *                 format: date
 *               external_assignment_date:
 *                 type: string
 *                 format: date
 *               process_type:
 *                 type: string
 *               case_number:
 *                 type: string
 *               procedural_summary:
 *                 type: string
 *               procedural_progress:
 *                 type: string
 *               demand_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *     responses:
 *       200:
 *         description: Proceso judicial actualizado
 *       404:
 *         description: Proceso no encontrado
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const process = await JudicialProcess.findByPk(req.params.id);

    if (!process) {
      return res.status(404).json({ error: 'Proceso judicial no encontrado' });
    }

    await process.update({
      ...req.body,
      updated_by: req.user.id
    });

    res.json({
      message: 'Proceso judicial actualizado',
      process
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/judicial-processes/{id}:
 *   delete:
 *     summary: Eliminar un proceso judicial
 *     tags:
 *       - Procesos Judiciales
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proceso judicial eliminado
 *       404:
 *         description: Proceso no encontrado
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const process = await JudicialProcess.findByPk(req.params.id);

    if (!process) {
      return res.status(404).json({ error: 'Proceso judicial no encontrado' });
    }

    await process.destroy();
    res.json({ message: 'Proceso judicial eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

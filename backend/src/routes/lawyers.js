const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/lawyers:
 *   get:
 *     summary: Obtener todos los abogados
 *     tags:
 *       - Abogados
 *     responses:
 *       200:
 *         description: Lista de abogados
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const lawyers = await Lawyer.findAll({
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });
    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/lawyers/{id}:
 *   get:
 *     summary: Obtener un abogado por ID
 *     tags:
 *       - Abogados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del abogado
 *       404:
 *         description: Abogado no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/lawyers:
 *   post:
 *     summary: Crear un nuevo abogado
 *     tags:
 *       - Abogados
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               lawyer_type:
 *                 type: string
 *                 enum: [internal, external]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               user_id:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - lawyer_type
 *               - status
 *     responses:
 *       201:
 *         description: Abogado creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, lawyer_type, status, user_id } = req.body;

    if (!first_name || !last_name || !email || !lawyer_type || !status) {
      return res.status(400).json({ error: 'Los campos first_name, last_name, email, lawyer_type y status son requeridos' });
    }

    const lawyerExisting = await Lawyer.findOne({ where: { email } });
    if (lawyerExisting) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const lawyer = await Lawyer.create({
      first_name,
      last_name,
      email,
      phone: phone || null,
      lawyer_type,
      status,
      user_id: user_id || null
    });

    res.status(201).json({
      message: 'Abogado creado exitosamente',
      lawyer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/lawyers/{id}:
 *   put:
 *     summary: Actualizar un abogado
 *     tags:
 *       - Abogados
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               lawyer_type:
 *                 type: string
 *                 enum: [internal, external]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Abogado actualizado
 *       404:
 *         description: Abogado no encontrado
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    await lawyer.update(req.body);

    res.json({
      message: 'Abogado actualizado',
      lawyer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/lawyers/{id}:
 *   delete:
 *     summary: Eliminar un abogado
 *     tags:
 *       - Abogados
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
 *         description: Abogado eliminado
 *       404:
 *         description: Abogado no encontrado
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    await lawyer.destroy();
    res.json({ message: 'Abogado eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

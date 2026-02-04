const express = require('express');
const router = express.Router();
const Maestro = require('../models/Maestro');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/maestro:
 *   get:
 *     summary: Obtener todos los registros maestros
 *     tags:
 *       - Maestro
 *     responses:
 *       200:
 *         description: Lista de registros maestros
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const maestros = await Maestro.findAll({
      order: [['code_maestro', 'ASC']]
    });
    res.json(maestros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/maestro/{id}:
 *   get:
 *     summary: Obtener un registro maestro por ID
 *     tags:
 *       - Maestro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del registro maestro
 *       404:
 *         description: Registro no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id);

    if (!maestro) {
      return res.status(404).json({ error: 'Registro maestro no encontrado' });
    }

    res.json(maestro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/maestro:
 *   post:
 *     summary: Crear un nuevo registro maestro
 *     tags:
 *       - Maestro
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               code_maestro:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo]
 *             required:
 *               - value
 *               - code_maestro
 *               - status
 *     responses:
 *       201:
 *         description: Registro maestro creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { value, code_maestro, status } = req.body;

    if (!value || !code_maestro || !status) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const maestro = await Maestro.create({
      value,
      code_maestro,
      status
    });

    res.status(201).json({
      message: 'Registro maestro creado exitosamente',
      maestro
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/maestro/{id}:
 *   put:
 *     summary: Actualizar un registro maestro
 *     tags:
 *       - Maestro
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
 *               value:
 *                 type: string
 *               code_maestro:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo]
 *     responses:
 *       200:
 *         description: Registro maestro actualizado
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id);

    if (!maestro) {
      return res.status(404).json({ error: 'Registro maestro no encontrado' });
    }

    await maestro.update(req.body);

    res.json({
      message: 'Registro maestro actualizado',
      maestro
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/maestro/{id}:
 *   delete:
 *     summary: Eliminar un registro maestro
 *     tags:
 *       - Maestro
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
 *         description: Registro maestro eliminado
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id);

    if (!maestro) {
      return res.status(404).json({ error: 'Registro maestro no encontrado' });
    }

    await maestro.destroy();
    res.json({ message: 'Registro maestro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

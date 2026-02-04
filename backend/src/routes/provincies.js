const express = require('express');
const router = express.Router();
const Provincie = require('../models/Provincie');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/provincies:
 *   get:
 *     summary: Obtener todas las provincies
 *     tags:
 *       - Provincias
 *     responses:
 *       200:
 *         description: Lista de provincies
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const provincies = await Provincie.findAll({
      order: [['name', 'ASC']]
    });
    res.json(provincies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/provincies/{id}:
 *   get:
 *     summary: Obtener una provincie por ID
 *     tags:
 *       - Provincias
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la provincia
 *       404:
 *         description: Provincia no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const provincie = await Provincie.findByPk(req.params.id);
    if (!provincie) {
      return res.status(404).json({ error: 'Provincia no encontrada' });
    }

    res.json(provincie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/provincies:
 *   post:
 *     summary: Crear una nueva provincia
 *     tags:
 *       - Provincias
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               postal_code:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Provincia creada exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, postal_code } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la provincia es requerido' });
    }

    const provinceExisting = await Provincie.findOne({ where: { name } });
    if (provinceExisting) {
      return res.status(400).json({ error: 'La provincia ya existe' });
    }

    const provincie = await Provincie.create({
      name,
      postal_code: postal_code || null
    });

    res.status(201).json({
      message: 'Provincia creada exitosamente',
      provincie
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/provincies/{id}:
 *   put:
 *     summary: Actualizar una provincia
 *     tags:
 *       - Provincias
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
 *               name:
 *                 type: string
 *               postal_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provincia actualizada
 *       404:
 *         description: Provincia no encontrada
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const provincie = await Provincie.findByPk(req.params.id);
    if (!provincie) {
      return res.status(404).json({ error: 'Provincia no encontrada' });
    }

    await provincie.update(req.body);

    res.json({
      message: 'Provincia actualizada',
      provincie
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/provincies/{id}:
 *   delete:
 *     summary: Eliminar una provincia
 *     tags:
 *       - Provincias
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
 *         description: Provincia eliminada
 *       404:
 *         description: Provincia no encontrada
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const provincie = await Provincie.findByPk(req.params.id);
    if (!provincie) {
      return res.status(404).json({ error: 'Provincia no encontrada' });
    }

    await provincie.destroy();
    res.json({ message: 'Provincia eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

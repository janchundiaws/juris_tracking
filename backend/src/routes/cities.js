const express = require('express');
const router = express.Router();
const City = require('../models/Citie');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Obtener todas las ciudades
 *     tags:
 *       - Ciudades
 *     responses:
 *       200:
 *         description: Lista de ciudades
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const cities = await City.findAll({
      order: [['name', 'ASC']]
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     summary: Obtener una ciudad por ID
 *     tags:
 *       - Ciudades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la ciudad
 *       404:
 *         description: Ciudad no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);

    if (!city) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities:
 *   post:
 *     summary: Crear una nueva ciudad
 *     tags:
 *       - Ciudades
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
 *         description: Ciudad creada exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, postal_code } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la ciudad es requerido' });
    }

    const cityExisting = await City.findOne({ where: { name } });
    if (cityExisting) {
      return res.status(400).json({ error: 'La ciudad ya existe' });
    }

    const city = await City.create({
      name,
      postal_code: postal_code || null
    });

    res.status(201).json({
      message: 'Ciudad creada exitosamente',
      city
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities/{id}:
 *   put:
 *     summary: Actualizar una ciudad
 *     tags:
 *       - Ciudades
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
 *         description: Ciudad actualizada
 *       404:
 *         description: Ciudad no encontrada
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);

    if (!city) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    await city.update(req.body);

    res.json({
      message: 'Ciudad actualizada',
      city
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     summary: Eliminar una ciudad
 *     tags:
 *       - Ciudades
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
 *         description: Ciudad eliminada
 *       404:
 *         description: Ciudad no encontrada
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);

    if (!city) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    await city.destroy();
    res.json({ message: 'Ciudad eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Creditor = require('../models/Creditor');
const { verifyToken } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

/**
 * @swagger
 * /api/creditors:
 *   get:
 *     summary: Obtener todos los acreedores
 *     tags:
 *       - Acreedores
 *     responses:
 *       200:
 *         description: Lista de acreedores
 *       500:
 *         description: Error del servidor
 */
router.get('/', tenantMiddleware , async (req, res) => {
  try {
    const creditors = await Creditor.findAll({
      where: { tenant_id: req.tenantId },
      order: [['name', 'ASC']]
    });
    res.json(creditors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/creditors/{id}:
 *   get:
 *     summary: Obtener un acreedor por ID
 *     tags:
 *       - Acreedores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del acreedor
 *       404:
 *         description: Acreedor no encontrado
 */
router.get('/:id', tenantMiddleware,  async (req, res) => {
  try {
    const creditor = await Creditor.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!creditor) {
      return res.status(404).json({ error: 'Acreedor no encontrado' });
    }

    res.json(creditor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/creditors:
 *   post:
 *     summary: Crear un nuevo acreedor
 *     tags:
 *       - Acreedores
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
 *               ruc:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *             required:
 *               - name
 *               - ruc
 *               - status
 *     responses:
 *       201:
 *         description: Acreedor creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const { name, ruc, status } = req.body;

    if (!name || !ruc || !status) {
      return res.status(400).json({ error: 'Los campos name, ruc y status son requeridos' });
    }

    const creditorExisting = await Creditor.findOne({ where: { ruc, tenant_id: req.tenantId } });
    if (creditorExisting) {
      return res.status(400).json({ error: 'El RUC ya está registrado' });
    }

    const creditor = await Creditor.create({
      name,
      ruc,
      status,
      tenant_id: req.tenantId
    });

    res.status(201).json({
      message: 'Acreedor creado exitosamente',
      creditor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/creditors/{id}:
 *   put:
 *     summary: Actualizar un acreedor
 *     tags:
 *       - Acreedores
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
 *               ruc:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Acreedor actualizado
 *       404:
 *         description: Acreedor no encontrado
 */
router.put('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const creditor = await Creditor.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!creditor) {
      return res.status(404).json({ error: 'Acreedor no encontrado' });
    }

    await creditor.update(req.body);

    res.json({
      message: 'Acreedor actualizado',
      creditor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/creditors/{id}:
 *   delete:
 *     summary: Eliminar un acreedor
 *     tags:
 *       - Acreedores
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
 *         description: Acreedor eliminado
 *       404:
 *         description: Acreedor no encontrado
 */
router.delete('/:id',tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const creditor = await Creditor.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!creditor) {
      return res.status(404).json({ error: 'Acreedor no encontrado' });
    }

    await creditor.destroy();
    res.json({ message: 'Acreedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

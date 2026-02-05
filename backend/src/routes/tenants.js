const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Obtener información del tenant actual
 *     tags:
 *       - Tenants
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Información del tenant
 *       404:
 *         description: Tenant no encontrado
 */
router.get('/', verifyToken, async (req, res) => {
  try {

    res.json({
      id: req.tenant.id,
      name: req.tenant.name,
      subdomain: req.tenant.subdomain,
      domain: req.tenant.domain,
      status: req.tenant.status,
      settings: req.tenant.settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/tenants:
 *   put:
 *     summary: Actualizar configuración del tenant actual
 *     tags:
 *       - Tenants
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
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tenant actualizado
 *       404:
 *         description: Tenant no encontrado
 */
router.put('/', verifyToken, async (req, res) => {
  try {
    if (!req.tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    const { name, settings } = req.body;

    await req.tenant.update({
      name: name || req.tenant.name,
      settings: settings !== undefined ? settings : req.tenant.settings
    });

    res.json({
      message: 'Tenant actualizado exitosamente',
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain,
        domain: req.tenant.domain,
        status: req.tenant.status,
        settings: req.tenant.settings
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

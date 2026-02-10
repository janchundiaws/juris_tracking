const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/tenants/current:
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
router.get('/current', verifyToken, async (req, res) => {
  try {
    if (!req.tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    res.json({
      success: true,
      data: {
        id: req.tenant.id,
        name: req.tenant.name,
        company_name: req.tenant.company_name,
        company_description: req.tenant.company_description,
        subdomain: req.tenant.subdomain,
        domain: req.tenant.domain,
        status: req.tenant.status,
        settings: req.tenant.settings,
        created_at: req.tenant.created_at,
        updated_at: req.tenant.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Obtener todos los tenants
 *     tags:
 *       - Tenants
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tenants
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Crear un nuevo tenant
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
 *             required:
 *               - name
 *               - subdomain
 *             properties:
 *               name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               company_description:
 *                 type: string
 *               subdomain:
 *                 type: string
 *               domain:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               settings:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tenant creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El subdominio ya existe
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, company_name, company_description, subdomain, domain, status, settings } = req.body;

    // Validar que el subdominio no exista
    const existingTenant = await Tenant.findOne({ where: { subdomain } });
    if (existingTenant) {
      return res.status(409).json({ 
        success: false,
        error: 'El subdominio ya está en uso' 
      });
    }

    const newTenant = await Tenant.create({
      name,
      company_name,
      company_description,
      subdomain,
      domain,
      status: status || 'active',
      settings: settings || {
        theme: 'light',
        language: 'es',
        timezone: 'America/Bogota',
        notifications_enabled: true,
        max_users: 10,
        features: {
          calendar_enabled: true,
          reports_enabled: true,
          documents_enabled: true
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tenant creado exitosamente',
      data: {
        id: newTenant.id,
        name: newTenant.name,
        company_name: newTenant.company_name,
        company_description: newTenant.company_description,
        subdomain: newTenant.subdomain,
        domain: newTenant.domain,
        status: newTenant.status,
        settings: newTenant.settings,
        created_at: newTenant.created_at
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false,
        error: 'Datos de validación incorrectos',
        details: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Obtener información de un tenant por ID
 *     tags:
 *       - Tenants
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
 *         description: Información del tenant
 *       404:
 *         description: Tenant no encontrado
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false,
        error: 'Tenant no encontrado' 
      });
    }

    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        company_name: tenant.company_name,
        company_description: tenant.company_description,
        subdomain: tenant.subdomain,
        domain: tenant.domain,
        status: tenant.status,
        settings: tenant.settings,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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

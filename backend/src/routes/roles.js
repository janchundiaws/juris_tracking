const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: Lista de roles
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener un rol por ID
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del rol
 *       404:
 *         description: Rol no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags:
 *       - Roles
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
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        error: 'El nombre del rol es requerido' 
      });
    }

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ 
        error: 'Ya existe un rol con ese nombre' 
      });
    }

    const role = await Role.create({
      name,
      description
    });

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Ya existe un rol con ese nombre' 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags:
 *       - Roles
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       404:
 *         description: Rol no encontrado
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const { name, description } = req.body;

    // Verificar si el nuevo nombre ya existe en otro rol
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json({ 
          error: 'Ya existe un rol con ese nombre' 
        });
      }
    }

    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description
    });

    res.json({
      message: 'Rol actualizado exitosamente',
      role
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Ya existe un rol con ese nombre' 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags:
 *       - Roles
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
 *         description: Rol eliminado exitosamente
 *       404:
 *         description: Rol no encontrado
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    await role.destroy();

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

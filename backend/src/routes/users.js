const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { verifyToken } = require('../middleware/auth');
const { publishNewUserEvent, publishUserUpdatedEvent } = require('../config/rabbitmq');
const { tenantMiddleware } = require('../middleware/tenant');

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *             required:
 *               - username
 *               - password
 *               - first_name
 *               - last_name
 *               - email
 *               - role_id
 *               - status
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/registro', tenantMiddleware, async (req, res) => {
  try {
    const { username, password, first_name, last_name, email, role_id, status } = req.body;

    if (!username || !password || !first_name || !last_name || !email || !role_id || !status) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar usuario existente en el contexto del tenant
    const { Op } = require("sequelize");
    const usuarioExistente = await User.findOne({ 
      where: {
        [Op.or]: [
          { email: email },
          { username: username }
        ]
      },
      where: { tenant_id: req.tenantId }
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email o el nombre de usuario ya están registrados' });
    }

    // Verificar que tenemos un tenantId
    if (!req.tenantId) {
      return res.status(400).json({ error: 'No se pudo determinar el tenant. Asegúrate de acceder desde un subdominio válido.' });
    }

    // Crear usuario con tenant_id
    const usuario = await User.create({
      tenant_id: req.tenantId,
      username,
      password,
      first_name,
      last_name,
      email,
      role_id,
      status
    });

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      tenant_id: usuario.tenant_id,
      role_id: usuario.role_id
    });

    // // Publicar mensaje en RabbitMQ
    // await publishNewUserEvent({
    //   id: usuario.id,
    //   username: usuario.username,
    //   first_name: usuario.first_name,
    //   last_name: usuario.last_name,
    //   email: usuario.email,
    //   role_id: usuario.role_id,
    //   status: usuario.status
    // });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        email: usuario.email,
        role_id: usuario.role_id,
        status: usuario.status
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Login de usuario con email y contraseña
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', tenantMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }

    // Buscar usuario en el contexto del tenant (si existe)
    const usuario = await User.findOne({ 
      where: { email, tenant_id: req.tenantId }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      role_id: usuario.role_id,
      tenant_id: usuario.tenant_id
    });

    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        email: usuario.email,
        role_id: usuario.role_id,
        status: usuario.status
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios (requiere autenticación)
 *     tags:
 *       - Usuarios
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: { exclude: ['password'] },
      tenantId: req.tenantId
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags:
 *       - Usuarios
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
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const usuario = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      tenantId: req.tenantId
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const usuario = await User.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update(req.body);

    await publishUserUpdatedEvent({
      id: usuario.id,
      username: usuario.username,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email,
      role_id: usuario.role_id,
      status: usuario.status
    });

    res.json({
      message: 'Usuario actualizado',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        email: usuario.email,
        role_id: usuario.role_id,
        status: usuario.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags:
 *       - Usuarios
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
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id',tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const usuario = await User.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

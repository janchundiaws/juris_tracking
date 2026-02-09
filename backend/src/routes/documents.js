const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { verifyToken } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Obtener todos los documentos
 *     tags:
 *       - Documentos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: judicial_process_id
 *         schema:
 *           type: string
 *         description: Filtrar documentos por ID de proceso judicial
 *     responses:
 *       200:
 *         description: Lista de documentos
 *       500:
 *         description: Error del servidor
 */
router.get('/', tenantMiddleware , verifyToken, async (req, res) => {
  try {
    const { judicial_process_id } = req.query;
    const whereClause = {
      status: 'active',
      tenant_id: req.tenantId
    };
    
    if (judicial_process_id) {
      whereClause.judicial_process_id = judicial_process_id;
    }

    const documents = await Document.findAll({
      where: whereClause,
      attributes: ['id', 'judicial_process_id', 'file_name', 'file_type', 'file_size', 'description', 'status', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Obtener un documento por ID
 *     tags:
 *       - Documentos
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
 *         description: Datos del documento
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      attributes: ['id', 'judicial_process_id', 'file_name', 'file_type', 'file_size', 'description', 'status', 'created_at', 'updated_at'],
      where: { tenant_id: req.tenantId }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Descargar un documento
 *     tags:
 *       - Documentos
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
 *         description: Archivo del documento
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/download', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Content-Length', document.file_size);
    
    res.send(document.file_data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Subir un nuevo documento
 *     tags:
 *       - Documentos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - judicial_process_id
 *               - file_name
 *               - file_data
 *             properties:
 *               judicial_process_id:
 *                 type: string
 *               file_name:
 *                 type: string
 *               file_type:
 *                 type: string
 *               file_size:
 *                 type: integer
 *               file_data:
 *                 type: string
 *                 description: Archivo codificado en base64
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Documento creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const { judicial_process_id, file_name, file_type, file_size, file_data, description } = req.body;

    if (!judicial_process_id || !file_name || !file_data) {
      return res.status(400).json({ error: 'judicial_process_id, file_name y file_data son requeridos' });
    }

    // Convertir base64 a buffer
    const fileBuffer = Buffer.from(file_data, 'base64');

    const document = await Document.create({
      judicial_process_id,
      file_name,
      file_type: file_type || 'application/octet-stream',
      file_size: file_size || fileBuffer.length,
      file_data: fileBuffer,
      description,
      status: 'active',
      tenant_id: req.tenantId
    });

    // Retornar sin file_data
    const responseDoc = await Document.findByPk(document.id, {
      attributes: ['id', 'judicial_process_id', 'file_name', 'file_type', 'file_size', 'description', 'status', 'created_at', 'updated_at'], 
      where: { tenant_id: req.tenantId }
    });

    res.status(201).json(responseDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Actualizar información de un documento
 *     tags:
 *       - Documentos
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, deleted]
 *     responses:
 *       200:
 *         description: Documento actualizado exitosamente
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const { description, status } = req.body;
    const document = await Document.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Solo permitir actualizar descripción y status
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    await document.update(updateData);

    const updatedDoc = await Document.findByPk(req.params.id, {
      attributes: ['id', 'judicial_process_id', 'file_name', 'file_type', 'file_size', 'description', 'status', 'created_at', 'updated_at'],
      where: { tenant_id: req.tenantId }
    });

    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Eliminar un documento (soft delete)
 *     tags:
 *       - Documentos
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
 *         description: Documento eliminado exitosamente
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', tenantMiddleware, verifyToken, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      where: { tenant_id: req.tenantId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Soft delete
    await document.update({ status: 'deleted' });

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

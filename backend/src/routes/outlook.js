const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/outlook/webhook:
 *   post:
 *     summary: Webhook para recibir notificaciones de nuevos correos de Outlook
 *     tags:
 *       - Outlook
 *     parameters:
 *       - in: query
 *         name: validationToken
 *         schema:
 *           type: string
 *         description: Token de validación de Microsoft
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Validación exitosa
 *       202:
 *         description: Notificación procesada
 *       400:
 *         description: Error en la solicitud
 */
router.post('/webhook', (req, res) => {
  // Validación inicial de Microsoft (requerido al crear la suscripción)
  if (req.query && req.query.validationToken) {
    console.log('✅ Validación de webhook recibida');
    return res.send(req.query.validationToken);
  }

  try {
    // Verificar que el body tenga el formato esperado
    if (!req.body || !req.body.value || !Array.isArray(req.body.value)) {
      return res.status(400).json({ error: 'Formato de notificación inválido' });
    }

    // Procesar cada notificación
    req.body.value.forEach((notificacion) => {
      console.log('📧 Nuevo correo detectado:', {
        subscriptionId: notificacion.subscriptionId,
        changeType: notificacion.changeType,
        resource: notificacion.resource,
        clientState: notificacion.clientState,
        timestamp: new Date().toISOString()
      });

      // Aquí puedes agregar la lógica para:
      // - Guardar la notificación en la base de datos
      // - Obtener detalles completos del correo usando Microsoft Graph API
      // - Procesar adjuntos automáticamente
      // - Crear casos judiciales basados en el correo
      // - Enviar alertas a usuarios específicos
      // - Extraer información de procesos judiciales
    });

    // Responder 202 (Accepted) para confirmar recepción
    res.sendStatus(202);
    
  } catch (error) {
    console.error('Error procesando webhook de Outlook:', error);
    res.sendStatus(500);
  }
});

/**
 * @swagger
 * /api/outlook/subscription:
 *   post:
 *     summary: Crear suscripción de webhook para nuevos correos
 *     tags:
 *       - Outlook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *               - notificationUrl
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Token de acceso de Microsoft Graph
 *               notificationUrl:
 *                 type: string
 *                 description: URL pública del webhook
 *               expirationHours:
 *                 type: integer
 *                 default: 4230
 *                 description: Horas hasta expiración (máximo 4230 = ~6 meses)
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *       400:
 *         description: Error en los datos
 *       500:
 *         description: Error del servidor
 */
router.post('/subscription', async (req, res) => {
  const { accessToken, notificationUrl, expirationHours = 4230 } = req.body;

  if (!accessToken || !notificationUrl) {
    return res.status(400).json({ 
      error: 'Se requiere accessToken y notificationUrl' 
    });
  }

  try {
    // Calcular fecha de expiración
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expirationHours);

    const response = await axios.post(
      'https://graph.microsoft.com/v1.0/subscriptions',
      {
        changeType: 'created',
        notificationUrl: notificationUrl,
        resource: "me/mailFolders('inbox')/messages",
        expirationDateTime: expirationDate.toISOString(),
        clientState: `state_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Suscripción de Outlook creada:', response.data);

    res.status(201).json({
      message: 'Suscripción creada exitosamente',
      subscription: response.data
    });
    
  } catch (error) {
    console.error('Error creando suscripción de Outlook:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al crear la suscripción',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * @swagger
 * /api/outlook/subscription/{id}:
 *   delete:
 *     summary: Eliminar una suscripción de webhook
 *     tags:
 *       - Outlook
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suscripción eliminada
 *       500:
 *         description: Error del servidor
 */
router.delete('/subscription/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Se requiere accessToken' });
  }

  try {
    await axios.delete(
      `https://graph.microsoft.com/v1.0/subscriptions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log(`✅ Suscripción ${id} eliminada`);
    res.json({ message: 'Suscripción eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error eliminando suscripción:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al eliminar la suscripción',
      details: error.response?.data || error.message 
    });
  }
});

/**
 * @swagger
 * /api/outlook/subscriptions:
 *   get:
 *     summary: Listar todas las suscripciones activas
 *     tags:
 *       - Outlook
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de suscripciones
 *       500:
 *         description: Error del servidor
 */
router.get('/subscriptions', async (req, res) => {
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: 'Se requiere accessToken' });
  }

  try {
    const response = await axios.get(
      'https://graph.microsoft.com/v1.0/subscriptions',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
    
  } catch (error) {
    console.error('Error obteniendo suscripciones:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al obtener suscripciones',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;
const amqp = require('amqplib');

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE_NAME = process.env.EXCHANGE_NAME;
const QUEUE_NAME = 'usuarios_queue';

// Conectar a RabbitMQ
async function connectRabbitMQ() {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();

      // Declarar exchange tipo 'topic' para enrutamiento flexible
      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

      // Declarar cola para usuarios
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      // Vincular cola al exchange con routing key
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'usuario.*');

      console.log('✅ Conectado a RabbitMQ');

      // Manejar cierre de conexión
      connection.on('close', () => {
        console.log('⚠️ Conexión a RabbitMQ cerrada');
        connection = null;
        channel = null;
      });

      connection.on('error', (err) => {
        console.error('❌ Error en conexión RabbitMQ:', err.message);
        connection = null;
        channel = null;
      });
    }

    return channel;
  } catch (error) {
    console.error('❌ Error al conectar a RabbitMQ:', error.message);
    throw error;
  }
}

// Publicar mensaje en RabbitMQ
async function publishMessage(routingKey, message) {
  try {
    const ch = await connectRabbitMQ();
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    ch.publish(
      EXCHANGE_NAME,
      routingKey,
      messageBuffer,
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now()
      }
    );

    console.log(`📤 Mensaje publicado: ${routingKey}`, message);
    return true;
  } catch (error) {
    console.error('❌ Error al publicar mensaje:', error.message);
    return false;
  }
}

// Publicar evento de nuevo usuario
async function publishNewUserEvent(userData) {
  const message = {
    event: 'usuario.creado',
    timestamp: new Date().toISOString(),
    data: {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol
    }
  };

  return await publishMessage('usuario.creado', message);
}

// Publicar evento de actualización de usuario
async function publishUserUpdatedEvent(userData) {
  const message = {
    event: 'usuario.actualizado',
    timestamp: new Date().toISOString(),
    data: {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol
    }
  };

  return await publishMessage('usuario.actualizado', message);
}

// Publicar evento de eliminación de usuario
async function publishUserDeletedEvent(userId) {
  const message = {
    event: 'usuario.eliminado',
    timestamp: new Date().toISOString(),
    data: {
      id: userId
    }
  };

  return await publishMessage('usuario.eliminado', message);
}

// Cerrar conexión
async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('✅ Conexión a RabbitMQ cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
  }
}

module.exports = {
  connectRabbitMQ,
  publishMessage,
  publishNewUserEvent,
  publishUserUpdatedEvent,
  publishUserDeletedEvent,
  closeConnection
};

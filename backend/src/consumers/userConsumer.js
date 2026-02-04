const { connectRabbitMQ } = require('../config/rabbitmq');

const QUEUE_NAME = 'usuarios_queue';
let mensajesRecibidos = [];

// Consumer que escucha mensajes de RabbitMQ
async function startUserConsumer() {
  try {
    const channel = await connectRabbitMQ();
    
    console.log(`👂 Esperando mensajes en la cola: ${QUEUE_NAME}...`);
    
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log('📥 Mensaje recibido de RabbitMQ:', event);
          
          // Guardar mensaje en memoria (en producción usa base de datos)
          mensajesRecibidos.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            event: event.event,
            data: event.data,
            processed: true
          });

          // Limitar a los últimos 100 mensajes
          if (mensajesRecibidos.length > 100) {
            mensajesRecibidos = mensajesRecibidos.slice(0, 100);
          }
          
          // Procesar según el tipo de evento
          switch(event.event) {
            case 'usuario.creado':
              console.log(`✅ Usuario creado: ${event.data.nombre} (${event.data.email})`);
              // Aquí puedes agregar lógica adicional:
              // - Enviar email de bienvenida
              // - Crear perfil en otro servicio
              // - Registrar en auditoría
              break;
              
            case 'usuario.actualizado':
              console.log(`🔄 Usuario actualizado: ${event.data.nombre}`);
              // Lógica para actualización
              break;
              
            case 'usuario.eliminado':
              console.log(`🗑️ Usuario eliminado: ${event.data.id}`);
              // Lógica para eliminación
              break;
              
            default:
              console.log(`ℹ️ Evento desconocido: ${event.event}`);
          }
          
          // Confirmar que el mensaje fue procesado correctamente
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error procesando mensaje:', error);
          // Rechazar mensaje y no reencolar (para evitar loops infinitos)
          channel.nack(msg, false, false);
        }
      }
    }, {
      noAck: false // Requiere confirmación manual
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error iniciando consumer:', error);
    return false;
  }
}

// Obtener mensajes recibidos
function getMensajesRecibidos() {
  return mensajesRecibidos;
}

// Limpiar mensajes
function limpiarMensajes() {
  mensajesRecibidos = [];
}

module.exports = {
  startUserConsumer,
  getMensajesRecibidos,
  limpiarMensajes
};

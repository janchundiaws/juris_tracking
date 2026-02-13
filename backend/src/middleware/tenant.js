const Tenant = require('../models/Tenant');

/**
 * Middleware para detectar y validar el tenant basado en el subdominio o dominio
 * Extrae el tenant automáticamente del header Host sin intervención del usuario
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener el host del request
    //const host = req.hostname || req.get('host')?.split(':')[0];
    const host = req.headers['x-tenant-id'];
    console.log('Host de la solicitud:', host);

    if (!host) {
      return res.status(400).json({ 
        error: 'No se pudo determinar el dominio de la solicitud' 
      });
    }

    // Si es localhost o IP, usar como está para desarrollo
    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      host = process.env.DEFAULT_TENANT;
    }

    // Buscar el tenant en la base de datos
    const tenant = await Tenant.findOne({
      where: {
        subdomain: host,
        status: 'active'
      }
    });

    // Si no existe el tenant y no estamos en desarrollo, rechazar
    if (!tenant) {
        return res.status(404).json({ 
          error: 'Tenant no encontrado o inactivo',
          subdomain: host 
        });
    } else {
      req.tenant = tenant;
    }

    // Agregar el tenant_id al contexto de la solicitud
    req.tenantId = req.tenant.id;
    
    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Tenant detectado: ${req.tenant.name} (${host})`);
    }

    next();
  } catch (error) {
    console.error('Error en tenantMiddleware:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el tenant',
      message: error.message 
    });
  }
};

/**
 * Middleware opcional para rutas que no requieren tenant
 * Útil para rutas públicas como login, registro, health check
 */
const optionalTenantMiddleware = async (req, res, next) => {
  try {
    const host = req.hostname || req.get('host')?.split(':')[0];
    const tenantFromHeader = req.headers['x-tenant-id'];
    console.log('🔍 Host de la solicitud (opcional):', tenantFromHeader);
    
    if (!host) {
      return next();
    }

    const parts = host.split('.');
    let subdomain;

    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      subdomain = process.env.DEFAULT_TENANT;
    } else if (parts.length >= 3) {
      subdomain = parts[0];
    } else if (parts.length === 2) {
      subdomain = parts[0];
    } else {
      subdomain = host;
    }

    const tenant = await Tenant.findOne({
      where: {
        subdomain: subdomain,
        status: 'active'
      }
    });

    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant.id;
    }

    next();
  } catch (error) {
    console.error('Error en optionalTenantMiddleware:', error);
    next();
  }
};

module.exports = {
  tenantMiddleware//,
  //optionalTenantMiddleware
};

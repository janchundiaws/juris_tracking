const Tenant = require('../models/Tenant');

/**
 * Middleware para detectar y validar el tenant basado en el subdominio o dominio
 * Extrae el tenant automáticamente del header Host sin intervención del usuario
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener el host del request
    const host = req.hostname || req.get('host')?.split(':')[0];
    
    if (!host) {
      return res.status(400).json({ 
        error: 'No se pudo determinar el dominio de la solicitud' 
      });
    }

    // Extraer subdominio del host
    // Ejemplo: cliente1.juristracking.com -> cliente1
    // Ejemplo: localhost -> localhost (para desarrollo)
    const parts = host.split('.');
    let subdomain;

    // Si es localhost o IP, usar como está para desarrollo
    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      subdomain = process.env.DEFAULT_TENANT || 'default';
    } else if (parts.length >= 3) {
      // Para dominios como cliente.juristracking.com
      subdomain = parts[0];
    } else if (parts.length === 2) {
      // Para dominios personalizados como cliente.com
      subdomain = parts[0];
    } else {
      subdomain = host;
    }

    // Buscar el tenant en la base de datos
    const tenant = await Tenant.findOne({
      where: {
        subdomain: subdomain,
        status: 'active'
      }
    });

    // Si no existe el tenant y no estamos en desarrollo, rechazar
    if (!tenant) {
      // En desarrollo, crear tenant automáticamente si no existe
      if (process.env.NODE_ENV === 'development') {
        const newTenant = await Tenant.create({
          name: `Tenant ${subdomain}`,
          subdomain: subdomain,
          status: 'active',
          settings: {}
        });
        
        req.tenant = newTenant;
        console.log(`✅ Tenant creado automáticamente: ${subdomain}`);
      } else {
        return res.status(404).json({ 
          error: 'Tenant no encontrado o inactivo',
          subdomain: subdomain 
        });
      }
    } else {
      req.tenant = tenant;
    }

    // Agregar el tenant_id al contexto de la solicitud
    req.tenantId = req.tenant.id;
    
    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Tenant detectado: ${req.tenant.name} (${subdomain})`);
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
    
    if (!host) {
      return next();
    }

    const parts = host.split('.');
    let subdomain;

    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      subdomain = process.env.DEFAULT_TENANT || 'default';
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
  tenantMiddleware,
  optionalTenantMiddleware
};

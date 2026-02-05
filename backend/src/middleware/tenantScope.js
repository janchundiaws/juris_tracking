/**
 * Hooks de Sequelize para aplicar filtrado automático por tenant
 * Estos hooks se agregan a cada modelo para aislar datos por tenant
 */

const addTenantScope = (model) => {
  // Hook antes de buscar (findAll, findOne, etc)
  model.addHook('beforeFind', (options) => {
    if (options.tenantId) {
      if (!options.where) {
        options.where = {};
      }
      options.where.tenant_id = options.tenantId;
    }
  });

  // Hook antes de crear
  model.addHook('beforeCreate', (instance, options) => {
    if (options.tenantId && !instance.tenant_id) {
      instance.tenant_id = options.tenantId;
    }
  });

  // Hook antes de actualizar
  model.addHook('beforeUpdate', (instance, options) => {
    if (options.tenantId) {
      if (!options.where) {
        options.where = {};
      }
      options.where.tenant_id = options.tenantId;
    }
  });

  // Hook antes de eliminar
  model.addHook('beforeDestroy', (instance, options) => {
    if (options.tenantId) {
      if (!options.where) {
        options.where = {};
      }
      options.where.tenant_id = options.tenantId;
    }
  });

  // Hook antes de bulk create
  model.addHook('beforeBulkCreate', (instances, options) => {
    if (options.tenantId) {
      instances.forEach(instance => {
        if (!instance.tenant_id) {
          instance.tenant_id = options.tenantId;
        }
      });
    }
  });

  // Hook antes de bulk update
  model.addHook('beforeBulkUpdate', (options) => {
    if (options.tenantId) {
      if (!options.where) {
        options.where = {};
      }
      options.where.tenant_id = options.tenantId;
    }
  });

  // Hook antes de bulk destroy
  model.addHook('beforeBulkDestroy', (options) => {
    if (options.tenantId) {
      if (!options.where) {
        options.where = {};
      }
      options.where.tenant_id = options.tenantId;
    }
  });
};

/**
 * Helper para ejecutar operaciones con contexto de tenant
 */
const withTenant = (tenantId) => {
  return { tenantId };
};

module.exports = {
  addTenantScope,
  withTenant
};

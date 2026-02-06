const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  event_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora del evento'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción del evento'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Lugar del evento'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Asociaciones
Event.associate = (models) => {
  Event.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Event.belongsTo(models.Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
  });
};

module.exports = Event;
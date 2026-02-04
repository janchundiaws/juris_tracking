const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  judicial_process_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'judicial_processes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['audiencia', 'diligencia', 'presentacion', 'notificacion', 'reunion', 'otro']]
    }
  },
  activity_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'media',
    validate: {
      isIn: [['baja', 'media', 'alta', 'urgente']]
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente',
    validate: {
      isIn: [['pendiente', 'en_progreso', 'completada', 'cancelada']]
    }
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Activity;

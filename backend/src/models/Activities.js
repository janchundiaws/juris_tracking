const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
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
  activity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['audiencia', 'diligencia', 'presentacion', 'notificacion', 'reunion', 'otro']]
    }
  },
  probable_activity_date: {
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
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lawyers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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

// Definir asociaciones
Activity.associate = (models) => {
  Activity.belongsTo(models.JudicialProcess, {
    foreignKey: 'judicial_process_id',
    as: 'judicial_process'
  });
  
  Activity.belongsTo(models.Lawyer, {
    foreignKey: 'assigned_to',
    as: 'assigned_lawyer'
  });
};

module.exports = Activity;

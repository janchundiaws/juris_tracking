const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JudicialProcess = sequelize.define('JudicialProcess', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  internal_lawyer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lawyers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  external_lawyer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lawyers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  provincie_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'provincies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  creditor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'creditors',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  product: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'maestro',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  guarantee: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'maestro',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  identification: {
    type: DataTypes.STRING(13),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 13]
    }
  },
  full_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  operation: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  area_assignment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  internal_assignment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  external_assignment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  process_type: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 150]
    }
  },
  case_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  procedural_summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  procedural_progress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  demand_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
    allowNull: false,
    defaultValue: 'activo'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  tableName: 'judicial_processes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = JudicialProcess;

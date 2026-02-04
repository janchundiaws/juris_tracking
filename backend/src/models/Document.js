const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  judicial_process_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: DataTypes.STRING,
  file_size: DataTypes.BIGINT,
  file_data: {
    type: DataTypes.BLOB("long"),
    allowNull: false
  },
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
    validate: {
      isIn: [["active", "inactive", "deleted"]]
    }
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
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Document;
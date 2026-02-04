const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Provincie = sequelize.define('Provincie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'provincies',
  timestamps: false,
  createdAt: false,
  updatedAt: false
});

module.exports = Provincie;

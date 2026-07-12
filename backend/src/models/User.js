const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  password_hash: { type: DataTypes.STRING, allowNull: true },
  current_latitude: { type: DataTypes.FLOAT, allowNull: true },
  current_longitude: { type: DataTypes.FLOAT, allowNull: true },
  location_updated_at: { type: DataTypes.DATE, allowNull: true },
  rating: { type: DataTypes.FLOAT, defaultValue: 5.0 }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;

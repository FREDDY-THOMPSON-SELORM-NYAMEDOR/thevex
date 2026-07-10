const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  match_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  payment_reference: { type: DataTypes.STRING, allowNull: true },
  payment_url: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;

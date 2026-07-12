const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  match_id: { type: DataTypes.INTEGER, allowNull: true },
  group_id: { type: DataTypes.INTEGER, allowNull: true },
  group_member_id: { type: DataTypes.INTEGER, allowNull: true },
  payment_type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'match' },
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

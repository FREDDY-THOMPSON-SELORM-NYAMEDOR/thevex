const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  group_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'probation' },
  payment_status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  payment_reference: { type: DataTypes.STRING, allowNull: true },
  payment_url: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'group_members',
  timestamps: true
});

module.exports = GroupMember;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  group_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'group_members',
  timestamps: true
});

module.exports = GroupMember;

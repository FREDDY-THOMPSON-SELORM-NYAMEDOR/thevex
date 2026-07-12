const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Group = sequelize.define('Group', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  location: { type: DataTypes.STRING, allowNull: false },
  origin: { type: DataTypes.STRING, allowNull: false },
  budget: { type: DataTypes.INTEGER, allowNull: false },
  max_members: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
  schedule_date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  join_deadline: { type: DataTypes.DATE, allowNull: false },
  split_rules: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'groups',
  timestamps: true
});

module.exports = Group;

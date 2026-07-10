const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ride1_id: { type: DataTypes.INTEGER, allowNull: false },
  ride2_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  user1_id: { type: DataTypes.INTEGER, allowNull: true },
  user2_id: { type: DataTypes.INTEGER, allowNull: true },
  user1_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  user2_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  user1_payment_status: { type: DataTypes.STRING, defaultValue: 'pending' },
  user2_payment_status: { type: DataTypes.STRING, defaultValue: 'pending' },
  pickup_location: { type: DataTypes.STRING, allowNull: true },
  dropoff_location: { type: DataTypes.STRING, allowNull: true },
  ride_time: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'matches',
  timestamps: true
});

module.exports = Match;

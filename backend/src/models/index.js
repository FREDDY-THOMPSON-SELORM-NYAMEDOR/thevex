const sequelize = require('../config/database');
const User = require('./User');
const RideRequest = require('./RideRequest');
const Match = require('./Match');
const Payment = require('./Payment');
const Group = require('./Group');
const GroupMember = require('./GroupMember');

User.hasMany(RideRequest, { foreignKey: 'user_id' });
RideRequest.belongsTo(User, { foreignKey: 'user_id' });

RideRequest.hasMany(Match, { foreignKey: 'ride1_id' });
RideRequest.hasMany(Match, { foreignKey: 'ride2_id' });
Match.belongsTo(RideRequest, { foreignKey: 'ride1_id', as: 'rideOne' });
Match.belongsTo(RideRequest, { foreignKey: 'ride2_id', as: 'rideTwo' });

Match.hasMany(Payment, { foreignKey: 'match_id' });
Payment.belongsTo(Match, { foreignKey: 'match_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Payment, { foreignKey: 'user_id' });

Group.hasMany(GroupMember, { foreignKey: 'group_id' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(GroupMember, { foreignKey: 'user_id' });
GroupMember.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  RideRequest,
  Match,
  Payment,
  Group,
  GroupMember
};

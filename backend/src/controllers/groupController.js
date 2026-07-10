const { Group, GroupMember, User } = require('../models');
const { getDbReady, getMemoryStore } = require('../utils/helpers');

let io;

function setIO(socketIO) {
  io = socketIO;
}

function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

async function serializeGroup(group, userId) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  if (!group) return null;

  if (dbReady) {
    const memberships = await GroupMember.findAll({ where: { group_id: group.id } });
    const isMember = userId ? memberships.some((m) => m.user_id === Number(userId)) : false;
    const memberCount = memberships.length;
    let members = [];

    if (isMember && memberCount > 0) {
      const userIds = memberships.map((membership) => membership.user_id);
      const users = await User.findAll({ where: { id: userIds } });
      members = users.map((user) => ({ id: user.id, name: user.name, email: user.email }));
    }

    return {
      ...group.get({ plain: true }),
      memberCount,
      isMember,
      members
    };
  }

  const memberships = memoryStore.groupMembers.filter((m) => m.group_id === group.id);
  const isMember = userId ? memberships.some((m) => m.user_id === Number(userId)) : false;
  const memberCount = memberships.length;
  const members = isMember
    ? memberships.map((membership) => {
        const user = memoryStore.users.find((u) => u.id === membership.user_id) || { id: membership.user_id, name: 'Rider' };
        return { id: user.id, name: user.name, email: user.email };
      })
    : [];

  return {
    ...group,
    memberCount,
    isMember,
    members
  };
}

const groupController = {
  async createGroup(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const userId = req.body.userId || 1;
      const groupPayload = {
        location: req.body.location,
        origin: req.body.origin,
        budget: req.body.budget,
        time: req.body.time,
        split_rules: req.body.split_rules
      };

      const group = dbReady
        ? await Group.create(groupPayload)
        : { id: memoryStore.groups.length + 1, ...groupPayload, createdAt: new Date(), updatedAt: new Date() };

      if (!dbReady) memoryStore.groups.push(group);

      const membership = dbReady
        ? await GroupMember.create({ group_id: group.id, user_id: userId })
        : { id: memoryStore.groupMembers.length + 1, group_id: group.id, user_id: userId, createdAt: new Date(), updatedAt: new Date() };

      if (!dbReady) memoryStore.groupMembers.push(membership);

      const groupForUser = await serializeGroup(group, userId);
      broadcast('groupCreated', { group: groupForUser });
      res.json({ success: true, group: groupForUser, membership });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async browseGroups(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const groupsRaw = dbReady ? await Group.findAll() : memoryStore.groups;
      const groups = await Promise.all(groupsRaw.map((group) => serializeGroup(group, userId)));
      res.json({ success: true, groups });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async joinGroup(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const { groupId, userId } = req.body;
      const membership = dbReady
        ? await GroupMember.create({ group_id: groupId, user_id: userId })
        : { id: memoryStore.groupMembers.length + 1, group_id: groupId, user_id: userId, createdAt: new Date(), updatedAt: new Date() };

      if (!dbReady) memoryStore.groupMembers.push(membership);

      const group = dbReady
        ? await Group.findByPk(groupId)
        : memoryStore.groups.find((entry) => entry.id === Number(groupId));

      const groupForUser = await serializeGroup(group, userId);
      broadcast('groupJoined', { groupId, userId, membership });
      res.json({ success: true, membership, group: groupForUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bookGroupRide(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const { groupId } = req.body;
      const group = dbReady
        ? await Group.findByPk(groupId)
        : memoryStore.groups.find((entry) => entry.id === Number(groupId));

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      const rideDetails = {
        provider: 'Bolt mock',
        driver: 'Zara',
        car: 'Toyota Camry',
        eta: '6 mins',
        groupId
      };
      broadcast('groupRideBooked', { groupId, ride: rideDetails });
      res.json({ success: true, ride: rideDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = { groupController, setIO };

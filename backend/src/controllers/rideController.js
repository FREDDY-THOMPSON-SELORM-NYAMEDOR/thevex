const { RideRequest, Match, User } = require('../models');
const { ensureUser, parseRideTime, getDbReady, getMemoryStore } = require('../utils/helpers');
const { buildLiveMatchState } = require('../utils/liveLocation');
const { Op } = require('sequelize');

let io;

function setIO(socketIO) {
  io = socketIO;
}

function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}

async function getUserRecord(userId) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  if (dbReady) {
    return User.findByPk(userId);
  }

  return memoryStore.users.find((entry) => entry.id === Number(userId)) || null;
}

async function getMatchRecord(matchId) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  if (dbReady) {
    return Match.findByPk(matchId);
  }

  return memoryStore.matches.find((entry) => entry.id === Number(matchId)) || null;
}

async function getActiveMatchesForUser(userId) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();
  const numericUserId = Number(userId);

  if (dbReady) {
    return Match.findAll({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          { user1_id: numericUserId },
          { user2_id: numericUserId }
        ]
      }
    });
  }

  return memoryStore.matches.filter((entry) =>
    ['pending', 'confirmed'].includes(entry.status) &&
    (entry.user1_id === numericUserId || entry.user2_id === numericUserId)
  );
}

async function getLiveMatchState(match) {
  if (!match) return null;

  const user1 = await getUserRecord(match.user1_id);
  const user2 = await getUserRecord(match.user2_id);
  return buildLiveMatchState({
    match,
    user1,
    user2
  });
}

async function emitLiveMatchState(match, reason = 'locationUpdate') {
  if (!match) return null;

  const liveLocationState = await getLiveMatchState(match);
  if (!liveLocationState) return null;

  emitToUser(match.user1_id, 'matchLocationUpdate', { reason, ...liveLocationState });
  emitToUser(match.user2_id, 'matchLocationUpdate', { reason, ...liveLocationState });
  return liveLocationState;
}

async function createRideRequestRecord(payload) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  if (dbReady) {
    return RideRequest.create(payload);
  }

  const request = {
    id: memoryStore.rideRequests.length + 1,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date()
  }; 
  memoryStore.rideRequests.push(request);
  return request;
}

async function findMatchingRide(request) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();
  const userOrigin = request.origin?.trim().toLowerCase();
  const userDestination = request.destination?.trim().toLowerCase();

  if (dbReady) {
    const windowStart = new Date(request.time.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(request.time.getTime() + 30 * 60 * 1000);

    const candidates = await RideRequest.findAll({
      where: {
        status: 'pending',
        time: { [Op.between]: [windowStart, windowEnd] }
      },
      order: [['createdAt', 'ASC']]
    });

    const match = candidates.find((candidate) => {
      const candidateOrigin = candidate.origin?.trim().toLowerCase();
      const candidateDestination = candidate.destination?.trim().toLowerCase();
      //console.log(candidate)
      return (
        candidate.user_id !== request.user_id &&
        candidateOrigin === userOrigin &&
        candidateDestination === userDestination
      );
    });
    if (!match) return null;

    const createdMatch = await Match.create({ 
      ride1_id: request.id, 
      ride2_id: match.id, 
      user1_id: request.user_id,
      user2_id: match.user_id,
      status: 'pending',
      pickup_location: request.origin,
      dropoff_location: request.destination,
      ride_time: request.time
    });
    await RideRequest.update({ status: 'matched' }, { where: { id: [request.id, match.id] } });
    const liveLocationState = await getLiveMatchState(createdMatch);

    const matchPayload = {
      matchId: createdMatch.id,
      request,
      counterParty: match,
      matchedRide: match
    };

    //console.log(request.user_id, match.user_id, request, match, createdMatch.id);
    emitToUser(request.user_id, 'matchFound', {
      matchId: createdMatch.id,
      request,              // their own request
      counterParty: match,  // the other rider
      liveLocationState
    });

    emitToUser(match.user_id, 'matchFound', {
      matchId: createdMatch.id,
      request: match,       // their own request
      counterParty: request, // the other rider
      liveLocationState
    });
    broadcast('rideMatched', { matchId: createdMatch.id, origin: request.origin, destination: request.destination });
    return createdMatch;
  }

  const windowStart = new Date(request.time.getTime() - 30 * 60 * 1000);
  const windowEnd = new Date(request.time.getTime() + 30 * 60 * 1000);

  const candidates = memoryStore.rideRequests.filter((candidate) => {
    const candidateTime = candidate.time instanceof Date ? candidate.time : new Date(candidate.time);
    const candidateOrigin = candidate.origin?.trim().toLowerCase();
    const candidateDestination = candidate.destination?.trim().toLowerCase();
    return (
      candidateOrigin === userOrigin &&
      candidateDestination === userDestination &&
      candidate.status === 'pending' &&
      candidate.user_id !== request.user_id &&
      candidateTime >= windowStart &&
      candidateTime <= windowEnd
    );
  });

  const match = candidates[0];
  if (!match) return null;

  const createdMatch = {
    id: memoryStore.matches.length + 1,
    ride1_id: request.id,
    ride2_id: match.id,
    user1_id: request.user_id,
    user2_id: match.user_id,
    status: 'pending',
    pickup_location: request.origin,
    dropoff_location: request.destination,
    ride_time: request.time,
    user1_confirmed: false,
    user2_confirmed: false,
    user1_payment_status: 'pending',
    user2_payment_status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  memoryStore.matches.push(createdMatch);
  request.status = 'matched';
  match.status = 'matched';

  const matchPayload = {
    matchId: createdMatch.id,
    request,
    counterParty: match,
    matchedRide: match
  };

  emitToUser(request.user_id, 'matchFound', {
    matchId: createdMatch.id,
    request,
    counterParty: match,
    liveLocationState: await getLiveMatchState(createdMatch)
  });

  emitToUser(match.user_id, 'matchFound', {
    matchId: createdMatch.id,
    request: match,
    counterParty: request,
    liveLocationState: await getLiveMatchState(createdMatch)
  });
  
  broadcast('rideMatched', { matchId: createdMatch.id, origin: request.origin, destination: request.destination });
  return createdMatch;
}

const rideController = {
  async findRide(req, res) {
    try {
      const { origin, destination, time, userName, userEmail } = req.body;
      const user = await ensureUser(userName, userEmail);

      const request = await createRideRequestRecord({
        origin,
        destination,
        time: parseRideTime(time),
        user_id: user.id,
        status: 'pending'
      });

      const match = await findMatchingRide(request);
      res.json({ success: true, request, match });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bookRide(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const { matchId } = req.body;
      let match;

      if (dbReady) {
        match = await Match.findByPk(matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
      } else {
        match = memoryStore.matches.find((entry) => entry.id === Number(matchId));
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
      }

      const candidates = dbReady
        ? await RideRequest.findAll({ where: { id: [match.ride1_id, match.ride2_id] } })
        : memoryStore.rideRequests.filter((entry) => entry.id === match.ride1_id || entry.id === match.ride2_id);

      const userIds = candidates.map((ride) => ride.user_id);
      const rideDetails = {
        provider: 'Uber/Bolt mock',
        driver: 'Ava',
        car: 'Tesla Model 3',
        eta: '4 mins',
        license: 'LXB-9824',
        matchId
      };

      userIds.forEach((userId) => emitToUser(userId, 'rideBooked', rideDetails));
      broadcast('rideBookedGlobal', { matchId, ride: rideDetails });

      res.json({ success: true, ride: rideDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateLocation(req, res) {
    try {
      const dbReady = getDbReady();
      const memoryStore = getMemoryStore();
      const { userId, latitude, longitude } = req.body;

      if (!userId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, message: 'userId, latitude, and longitude are required' });
      }

      const numericLatitude = Number(latitude);
      const numericLongitude = Number(longitude);

      if (!Number.isFinite(numericLatitude) || !Number.isFinite(numericLongitude)) {
        return res.status(400).json({ success: false, message: 'latitude and longitude must be valid numbers' });
      }

      if (dbReady) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.current_latitude = numericLatitude;
        user.current_longitude = numericLongitude;
        user.location_updated_at = new Date();
        await user.save();
      } else {
        const user = memoryStore.users.find((entry) => entry.id === Number(userId));
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.current_latitude = numericLatitude;
        user.current_longitude = numericLongitude;
        user.location_updated_at = new Date();
      }

      const matches = await getActiveMatchesForUser(userId);
      for (const match of matches) {
        await emitLiveMatchState(match, 'locationUpdate');
      }

      emitToUser(userId, 'userLocationUpdated', {
        userId: Number(userId),
        latitude: numericLatitude,
        longitude: numericLongitude,
        updatedAt: new Date()
      });

      res.json({ success: true, location: { latitude: numericLatitude, longitude: numericLongitude } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getMatchLiveState(req, res) {
    try {
      const { matchId } = req.params;
      const match = await getMatchRecord(matchId);
      if (!match) {
        return res.status(404).json({ success: false, message: 'Match not found' });
      }

      const liveLocationState = await getLiveMatchState(match);
      res.json({ success: true, liveLocationState });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = { rideController, setIO };

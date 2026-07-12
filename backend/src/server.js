require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const { User, RideRequest, Match, Payment, Group, GroupMember } = require('./models');
const { setDbReady, setMemoryStore, getMemoryStore, getDbReady } = require('./utils/helpers');

// Controllers
const userController = require('./controllers/userController');
const { rideController, setIO: setRideIO } = require('./controllers/rideController');
const { matchController, setIO: setMatchIO } = require('./controllers/matchController');
const { paymentController, setIO: setPaymentIO } = require('./controllers/paymentController');
const { groupController, setIO: setGroupIO } = require('./controllers/groupController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Initialize Socket.io for all controllers
setRideIO(io);
setMatchIO(io);
setPaymentIO(io);
setGroupIO(io);

// Socket.io connection handler
io.on('connection', (socket) => {
  socket.on('joinUser', (userId) => {
    socket.join(`user:${userId}`);
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'VEX backend is running' });
});

// User routes 
app.post('/auth/signup', userController.signup);
app.post('/auth/login', userController.login);
app.post('/auth/logout', userController.logout);
app.post('/user/getOrCreate', userController.getOrCreateUser);
app.get('/user/:userId', userController.getUserById);

// Ride routes
app.post('/findRide', rideController.findRide);
app.post('/bookRide', rideController.bookRide);
app.post('/location/update', rideController.updateLocation);
app.get('/match/:matchId/live', rideController.getMatchLiveState);

// Match routes
app.post('/confirmMatch', matchController.confirmMatch);
app.post('/updatePaymentStatus', matchController.updatePaymentStatus);
app.get('/activeRides/:userId', matchController.getActiveRides);

// Payment routes
app.post('/processPayment', paymentController.processPayment);
app.post('/transaction/initialize', paymentController.processPayment);
app.get('/verifyPayment/:reference', paymentController.verifyPayment);
app.get('/transaction/verify/:reference', paymentController.verifyPayment);
app.get('/paystack/callback', paymentController.paystackCallback);

// Group routes
app.post('/createGroup', groupController.createGroup);
app.get('/browseGroups', groupController.browseGroups);
app.post('/joinGroup', groupController.joinGroup);
app.post('/bookGroupRide', groupController.bookGroupRide);

app.post('/reset-app-data', async (_req, res) => {
  try {
    const dbReady = getDbReady();
    const memoryStore = getMemoryStore();

    if (dbReady) {
      await sequelize.query('TRUNCATE TABLE payments, matches, ride_requests, group_members, groups, users RESTART IDENTITY CASCADE;');
    } else {
      memoryStore.users = [];
      memoryStore.rideRequests = [];
      memoryStore.matches = [];
      memoryStore.payments = [];
      memoryStore.groups = [];
      memoryStore.groupMembers = [];
    }

    res.json({ success: true, message: 'App data cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Database initialization and seeding
async function seedData() {
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      { name: 'Mia', email: 'mia@vex.app', rating: 4.9 },
      { name: 'Tunde', email: 'tunde@vex.app', rating: 4.7 },
      { name: 'Demo Rider', email: 'demo@vex.app', rating: 5.0 }
    ]);
  }
}

async function init() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    setDbReady(true);
    console.log('Database connected');
    await seedData();
  } catch (error) {
    console.log('Database unavailable, using in-memory fallback:', error.message);
    // Initialize memory store for fallback
    setMemoryStore({
      users: [],
      rideRequests: [],
      matches: [],
      payments: [],
      groups: [],
      groupMembers: []
    });
  }

  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log(`VEX backend listening on ${port}`));
}

init();
module.exports = { app, server, io };



# VEX Backend Architecture

## Project Structure

```
backend/
├── src/
│   ├── server.js                 # Clean entry point - routes only
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── User.js
│   │   ├── RideRequest.js
│   │   ├── Match.js
│   │   ├── Payment.js
│   │   ├── Group.js
│   │   ├── GroupMember.js
│   │   └── index.js
│   ├── migrations/
│   │   └── 001-initial-schema.js
│   ├── controllers/              # Business logic controllers
│   │   ├── userController.js    # User management
│   │   ├── rideController.js    # Ride matching & booking
│   │   ├── matchController.js   # Match confirmation
│   │   ├── paymentController.js # Payment processing
│   │   └── groupController.js   # Group management
│   └── utils/
│       └── helpers.js           # Shared utilities & helpers
├── package.json
└── ARCHITECTURE.md (this file)
```

## Architecture Overview

### server.js
Clean entry point that:
- Sets up Express and Socket.io
- Imports and initializes controllers
- Defines route mappings
- Handles database initialization
- Exports app, server, and io instances

### Controllers

#### userController.js
- `getOrCreateUser()` - Get or create user
- `getUserById()` - Fetch user by ID

#### rideController.js
- `findRide()` - Search and match rides
- `bookRide()` - Confirm and book a matched ride
- Internal helpers: `createRideRequestRecord()`, `findMatchingRide()`

#### matchController.js
- `confirmMatch()` - Confirm a matched ride

#### paymentController.js
- `processPayment()` - Initialize Paystack payment
- `verifyPayment()` - Verify payment reference
- `paystackCallback()` - Handle payment callback
- Internal helpers: `createPaymentRecord()`, `initializePaystackTransaction()`, `verifyPaystackReference()`

#### groupController.js
- `createGroup()` - Create a new ride group
- `browseGroups()` - List all groups
- `joinGroup()` - Join an existing group
- `bookGroupRide()` - Book a ride for the group
- Internal helpers: `serializeGroup()`

### utils/helpers.js
Shared utilities:
- `parseRideTime()` - Parse time strings
- `ensureUser()` - Get or create user
- `findUserById()` - Fetch user
- Database state management: `setDbReady()`, `getDbReady()`, `setMemoryStore()`, `getMemoryStore()`

## Key Design Principles

✅ **Separation of Concerns** - Each controller handles one domain  
✅ **Clean Server** - server.js is focused on routes and setup only  
✅ **Reusable Helpers** - Shared logic in utils/helpers.js  
✅ **Socket.io Integration** - Controllers receive io instance via `setIO()`  
✅ **Database Abstraction** - Fallback to in-memory store if DB is unavailable  

## Routes

### User
- `POST /user/getOrCreate` - Create or get user
- `GET /user/:userId` - Get user details

### Rides
- `POST /findRide` - Find and match rides
- `POST /bookRide` - Book a matched ride

### Matches
- `POST /confirmMatch` - Confirm a match

### Payments
- `POST /processPayment` - Initialize payment
- `GET /verifyPayment/:reference` - Verify payment
- `GET /transaction/initialize` - Initialize transaction
- `GET /transaction/verify/:reference` - Verify transaction
- `GET /paystack/callback` - Payment callback

### Groups
- `POST /createGroup` - Create group
- `GET /browseGroups` - List groups
- `POST /joinGroup` - Join group
- `POST /bookGroupRide` - Book group ride

## Running the Server

```bash
npm start              # Production mode
npm run dev           # Development with nodemon
```

The server listens on port 4000 (or PORT environment variable).

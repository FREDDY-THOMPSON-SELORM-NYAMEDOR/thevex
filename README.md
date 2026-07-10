# VEX Ride Sharing App

A fullstack ride-sharing MVP with real-time matching, Paystack payment flow, mocked ride booking, and live groups.

## Features

- Real-time ride matching using Socket.io
- Paystack transaction initialization and verification
- Mocked Uber/Bolt ride booking with driver/car/ETA details
- Live group creation, join, and booking notifications
- Fullstack app with separate backend and Expo frontend
- Seeded data for quick local testing

## Backend

### Setup

1. Open a terminal and navigate to `backend`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in `backend` with:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
PAYSTACK_CALLBACK_URL=http://localhost:4000/paystack/callback
DB_NAME=vex
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
PORT=4000
```

4. Start the backend:

```bash
npm run dev
```

### API Endpoints

- `POST /findRide` — create a ride request and attempt a match
- `POST /processPayment` — initialize Paystack payment for a match
- `GET /verifyPayment/:reference` — verify Paystack transaction status
- `POST /bookRide` — mock ride booking for a confirmed match
- `POST /createGroup` — create a live group
- `GET /browseGroups` — list groups
- `POST /joinGroup` — join a group
- `POST /bookGroupRide` — book a group ride mock

## Frontend

### Setup

1. Open a terminal and navigate to `frontend-new`
2. Install dependencies:

```bash
cd frontend-new
npm install
```

3. Launch the Expo app:

```bash
npm start
```

4. Open the app in Expo Go, Android emulator, or web.

### Notes

- The frontend expects the backend at `http://localhost:4000`
- Socket.io is used for live ride/group notifications
- Use Paystack test card `4084 4084 0840 8408` with any future expiry and CVV

## Running Locally

Start backend and frontend in separate terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend-new
npm start
```

## Quick Test Flow

1. Open the frontend app
2. Tap `Find Ride`
3. Continue to payment
4. Complete payment through Paystack test checkout
5. Verify payment and book ride
6. Explore groups and watch live updates

## Styling

- Bold teal + orange color theme
- Modern mobile-ready UI
- Placeholders for logo and ride details

## Important

- Use a Paystack test secret key for payments
- If PostgreSQL is unavailable, the backend will use in-memory fallback data

Enjoy building and testing the VEX app!
const axios = require('axios');
const { Payment, Match, GroupMember, Group } = require('../models');
const { findUserById, getDbReady, getMemoryStore } = require('../utils/helpers');

let io;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:4000/paystack/callback';

function setIO(socketIO) {
  io = socketIO;
}

function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

function markMatchConfirmedIfPaid(match) {
  if (
    match &&
    match.status !== 'confirmed' &&
    match.user1_payment_status === 'success' &&
    match.user2_payment_status === 'success'
  ) {
    match.status = 'confirmed';
    return true;
  }

  return false;
}

async function createPaymentRecord(payload) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  if (dbReady) {
    return Payment.create(payload);
  }
  const payment = {
    id: memoryStore.payments.length + 1,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  memoryStore.payments.push(payment);
  return payment;
}

function getGroupShareAmount(group) {
  const budget = Number(group?.budget || 0);
  const maxMembers = Number(group?.max_members || 1) || 1;
  return Math.max(1, Math.round(budget / maxMembers));
}

async function initializePaystackTransaction({ paymentType, matchId, groupId, groupMemberId, userId, amount }) {
  const payer = await findUserById(userId);
  
  if (!payer) {
    throw new Error(`User with ID ${userId} not found`);
  }

  const share = paymentType === 'group' ? Number(amount) : Math.round(amount / 2);
  if (!Number.isFinite(share) || share < 1) {
    throw new Error('Payment amount must be a positive number');
  }

  const paystackResponse = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: payer.email || 'demo@vex.app',
      amount: share * 100,
      currency: 'GHS',
      callback_url: PAYSTACK_CALLBACK_URL,
      metadata: { paymentType, matchId, groupId, groupMemberId, userId }
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const { authorization_url, reference } = paystackResponse.data.data;

  const paymentRecord = await createPaymentRecord({
    match_id: paymentType === 'match' ? matchId : null,
    group_id: paymentType === 'group' ? groupId : null,
    group_member_id: paymentType === 'group' ? groupMemberId : null,
    payment_type: paymentType,
    user_id: userId,
    amount: share,
    status: 'pending',
    payment_reference: reference,
    payment_url: authorization_url
  });

  return { authorizationUrl: authorization_url, reference, share, payment: paymentRecord };
}

async function verifyPaystackReference(reference) {
  const dbReady = getDbReady();
  const memoryStore = getMemoryStore();

  const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
  });

  const result = verifyResponse.data.data;
  const status = result.status === 'success' ? 'success' : 'failed';

  let payment;
  if (dbReady) {
    payment = await Payment.findOne({ where: { payment_reference: reference } });
  } else {
    payment = memoryStore.payments.find((entry) => entry.payment_reference === reference);
  }

  if (!payment) {
    throw new Error('Payment record not found');
  }

  payment.status = status;
  if (dbReady) {
    await payment.save();
    
    if (payment.payment_type === 'group' || payment.group_member_id) {
      const membership = await GroupMember.findByPk(payment.group_member_id);
      if (membership) {
        membership.payment_status = status;
        if (status === 'success') {
          membership.status = 'verified';
        }
        membership.payment_reference = payment.payment_reference;
        membership.payment_url = payment.payment_url;
        await membership.save();

        const group = await Group.findByPk(membership.group_id);
        emitToUser(payment.user_id, 'groupPaymentStatus', {
          groupId: membership.group_id,
          groupMemberId: membership.id,
          status,
          membership,
          paymentAmount: group ? getGroupShareAmount(group) : payment.amount
        });

        if (status === 'success') {
          emitToUser(payment.user_id, 'groupMemberVerified', {
            groupId: membership.group_id,
            groupMemberId: membership.id,
            membership
          });
        }
      }
    } else {
      // Update match payment status
      const match = await Match.findByPk(payment.match_id);
      if (match) {
        if (match.user1_id === payment.user_id) {
          match.user1_payment_status = status;
        } else if (match.user2_id === payment.user_id) {
          match.user2_payment_status = status;
        }

        const matchConfirmed = markMatchConfirmedIfPaid(match);

        await match.save();
        
        // Notify both users about payment status update
        emitToUser(match.user1_id, 'paymentStatusUpdate', { matchId: match.id, user1_status: match.user1_payment_status, user2_status: match.user2_payment_status });
        emitToUser(match.user2_id, 'paymentStatusUpdate', { matchId: match.id, user1_status: match.user1_payment_status, user2_status: match.user2_payment_status });

        if (matchConfirmed) {
          emitToUser(match.user1_id, 'rideConfirmed', { matchId: match.id, status: 'confirmed', match });
          emitToUser(match.user2_id, 'rideConfirmed', { matchId: match.id, status: 'confirmed', match });
        }
      }
    }
  } else {
    // Update in memory store
    if (payment.payment_type === 'group' || payment.group_member_id) {
      const membership = memoryStore.groupMembers.find((entry) => entry.id === payment.group_member_id);
      if (membership) {
        membership.payment_status = status;
        if (status === 'success') {
          membership.status = 'verified';
        }
        membership.payment_reference = payment.payment_reference;
        membership.payment_url = payment.payment_url;

        emitToUser(payment.user_id, 'groupPaymentStatus', {
          groupId: membership.group_id,
          groupMemberId: membership.id,
          status,
          membership,
          paymentAmount: payment.amount
        });

        if (status === 'success') {
          emitToUser(payment.user_id, 'groupMemberVerified', {
            groupId: membership.group_id,
            groupMemberId: membership.id,
            membership
          });
        }
      }
    } else {
      const match = memoryStore.matches.find((m) => m.id === payment.match_id);
      if (match) {
        if (match.user1_id === payment.user_id) {
          match.user1_payment_status = status;
        } else if (match.user2_id === payment.user_id) {
          match.user2_payment_status = status;
        }

        const matchConfirmed = markMatchConfirmedIfPaid(match);

        if (matchConfirmed) {
          emitToUser(match.user1_id, 'rideConfirmed', { matchId: match.id, status: 'confirmed', match });
          emitToUser(match.user2_id, 'rideConfirmed', { matchId: match.id, status: 'confirmed', match });
        }
      }
    }
  }

  emitToUser(payment.user_id, 'paymentStatus', { matchId: payment.match_id, status, payment });
  return { payment, paystack: result };
}

const paymentController = {
  async processPayment(req, res) {
    try {
      const { matchId, groupId, groupMemberId, userId, amount } = req.body;
      if (!userId || !amount || (!matchId && !groupMemberId)) {
        return res.status(400).json({ success: false, message: 'userId, amount, and a payment target are required' });
      }
      const paymentType = groupMemberId ? 'group' : 'match';
      const data = await initializePaystackTransaction({ paymentType, matchId, groupId, groupMemberId, userId, amount });
      res.json({ success: true, ...data });
    } catch (error) {
      console.error('Error in processPayment:', error.response?.data || error.message);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.response?.data?.message || error.message });
    }
  },

  async verifyPayment(req, res) {
    try {
      const { reference } = req.params;
      const data = await verifyPaystackReference(reference);
      res.json({ success: true, ...data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async paystackCallback(req, res) {
    try {
      const { reference } = req.query;
      if (!reference) {
        return res.send('<h1>Payment callback received</h1><p>No reference provided.</p>');
      }

      await axios.get(`http://localhost:${process.env.PORT || 4000}/verifyPayment/${encodeURIComponent(reference)}`);
      res.send(`<h1>Payment processed</h1><p>Reference: ${reference}</p><p>Return to the app to continue.</p>`);
    } catch (error) {
      res.status(500).send(`<h1>Payment callback error</h1><p>${error.message}</p>`);
    }
  }
};

module.exports = { paymentController, setIO };

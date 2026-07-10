const { ensureUser, findUserByEmail, findUserById } = require('../utils/helpers');

const userController = {
  async getOrCreateUser(req, res) {
    try {
      const { userName, userEmail } = req.body;
      const user = await ensureUser(userName, userEmail);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async signup(req, res) {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.json({ success: true, user: existingUser, message: 'Welcome back' });
      }

      const user = await ensureUser(name, email);
      res.json({ success: true, user, message: 'Account created' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found for this email' });
      }

      res.json({ success: true, user, message: 'Logged in' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async logout(req, res) {
    try {
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = userController;

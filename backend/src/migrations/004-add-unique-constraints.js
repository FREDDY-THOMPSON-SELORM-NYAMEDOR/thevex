module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint on email
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_users_email'
    });

    // Add unique constraint on phone (allow nulls)
    await queryInterface.addConstraint('users', {
      fields: ['phone'],
      type: 'unique',
      name: 'unique_users_phone'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('users', 'unique_users_email');
    await queryInterface.removeConstraint('users', 'unique_users_phone');
  }
};

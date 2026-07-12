module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('users', 'current_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'current_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'location_updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'user1_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'user1_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'user2_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'user2_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'car_latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'car_longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('matches', 'pickup_sequence', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('matches', 'pickup_sequence');
    await queryInterface.removeColumn('matches', 'car_longitude');
    await queryInterface.removeColumn('matches', 'car_latitude');
    await queryInterface.removeColumn('matches', 'user2_longitude');
    await queryInterface.removeColumn('matches', 'user2_latitude');
    await queryInterface.removeColumn('matches', 'user1_longitude');
    await queryInterface.removeColumn('matches', 'user1_latitude');
    await queryInterface.removeColumn('users', 'location_updated_at');
    await queryInterface.removeColumn('users', 'current_longitude');
    await queryInterface.removeColumn('users', 'current_latitude');
  }
};
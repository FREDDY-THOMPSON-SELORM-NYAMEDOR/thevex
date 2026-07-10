module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('matches', 'user1_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('matches', 'user2_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('matches', 'user1_confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('matches', 'user2_confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('matches', 'user1_payment_status', {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    });
    
    await queryInterface.addColumn('matches', 'user2_payment_status', {
      type: Sequelize.STRING,
      defaultValue: 'pending'
    });
    
    await queryInterface.addColumn('matches', 'pickup_location', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('matches', 'dropoff_location', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('matches', 'ride_time', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('matches', 'user1_id');
    await queryInterface.removeColumn('matches', 'user2_id');
    await queryInterface.removeColumn('matches', 'user1_confirmed');
    await queryInterface.removeColumn('matches', 'user2_confirmed');
    await queryInterface.removeColumn('matches', 'user1_payment_status');
    await queryInterface.removeColumn('matches', 'user2_payment_status');
    await queryInterface.removeColumn('matches', 'pickup_location');
    await queryInterface.removeColumn('matches', 'dropoff_location');
    await queryInterface.removeColumn('matches', 'ride_time');
  }
};

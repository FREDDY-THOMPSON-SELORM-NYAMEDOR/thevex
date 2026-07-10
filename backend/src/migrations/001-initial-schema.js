module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      rating: { type: Sequelize.FLOAT, defaultValue: 5.0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('ride_requests', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      origin: { type: Sequelize.STRING, allowNull: false },
      destination: { type: Sequelize.STRING, allowNull: false },
      time: { type: Sequelize.DATE, allowNull: false },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('ride_requests', ['origin', 'destination', 'time']);

    await queryInterface.createTable('matches', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ride1_id: { type: Sequelize.INTEGER, references: { model: 'ride_requests', key: 'id' } },
      ride2_id: { type: Sequelize.INTEGER, references: { model: 'ride_requests', key: 'id' } },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      match_id: { type: Sequelize.INTEGER, references: { model: 'matches', key: 'id' } },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('groups', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      location: { type: Sequelize.STRING, allowNull: false },
      origin: { type: Sequelize.STRING, allowNull: false },
      budget: { type: Sequelize.INTEGER, allowNull: false },
      time: { type: Sequelize.STRING, allowNull: false },
      split_rules: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('group_members', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      group_id: { type: Sequelize.INTEGER, references: { model: 'groups', key: 'id' } },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('group_members');
    await queryInterface.dropTable('groups');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('matches');
    await queryInterface.dropTable('ride_requests');
    await queryInterface.dropTable('users');
  }
};

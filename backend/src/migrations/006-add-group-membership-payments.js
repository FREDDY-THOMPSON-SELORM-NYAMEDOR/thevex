module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('groups', 'max_members', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 4
    });

    await queryInterface.addColumn('group_members', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'probation'
    });

    await queryInterface.addColumn('group_members', 'payment_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('group_members', 'payment_reference', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('group_members', 'payment_url', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('payments', 'match_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'matches', key: 'id' }
    });

    await queryInterface.addColumn('payments', 'group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'groups', key: 'id' }
    });

    await queryInterface.addColumn('payments', 'group_member_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'group_members', key: 'id' }
    });

    await queryInterface.addColumn('payments', 'payment_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'match'
    });
  },

  down: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.removeColumn('payments', 'payment_type');
    await queryInterface.removeColumn('payments', 'group_member_id');
    await queryInterface.removeColumn('payments', 'group_id');
    await queryInterface.changeColumn('payments', 'match_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'matches', key: 'id' }
    });
    await queryInterface.removeColumn('group_members', 'payment_url');
    await queryInterface.removeColumn('group_members', 'payment_reference');
    await queryInterface.removeColumn('group_members', 'payment_status');
    await queryInterface.removeColumn('group_members', 'status');
    await queryInterface.removeColumn('groups', 'max_members');
  }
};
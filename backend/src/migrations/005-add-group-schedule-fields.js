module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('groups', 'schedule_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('groups', 'join_deadline', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('groups', 'join_deadline');
    await queryInterface.removeColumn('groups', 'schedule_date');
  }
};
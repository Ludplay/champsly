module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tournaments', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('tournaments', 'user_id');
  }
};

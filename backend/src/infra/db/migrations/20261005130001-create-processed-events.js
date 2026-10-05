module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('processed_events', {
      consumer_group: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('processed_events');
  }
};

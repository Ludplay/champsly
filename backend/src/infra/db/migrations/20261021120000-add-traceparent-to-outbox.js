// W3C trace context of the request or message that stored the event, so the relay can continue its trace.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('outbox', 'traceparent', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('outbox', 'traceparent');
  }
};

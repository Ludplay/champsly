module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outbox', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message_key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      occurred_on: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // clock_timestamp(), unlike now(), advances within a transaction, so rows added together keep their order.
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('clock_timestamp()')
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    await queryInterface.addIndex('outbox', ['created_at'], {
      name: 'outbox_unpublished_created_at_idx',
      where: { published_at: null }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('outbox');
  }
};

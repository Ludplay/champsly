// Players were the one entity with no owner, so every user saw every player.
// No backfill here: which account should own pre-existing players is a per-environment
// decision, not something a migration can know. A database that still has ownerless
// players fails fast instead, before anything is changed.
module.exports = {
  async up(queryInterface, Sequelize) {
    const [[{ count: playersCount }]] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS count FROM players'
    );

    if (playersCount > 0) {
      throw new Error(
        `Cannot add players.user_id: ${playersCount} existing players would have no owner. ` +
        'This migration expects an empty players table and does not assign owners.'
      );
    }

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('players', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }, { transaction });

      await queryInterface.addIndex('players', ['user_id'], { transaction });
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('players', 'user_id');
  }
};

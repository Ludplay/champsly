module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`UPDATE phases SET status = 'finished' WHERE status = 'completed'`);
    await queryInterface.sequelize.query(`UPDATE phases SET status = 'in_progress' WHERE status = 'active'`);
    await queryInterface.sequelize.query(`UPDATE phases SET status = 'waiting' WHERE status NOT IN ('waiting', 'in_progress', 'finished')`);
  },
  async down() {}
};

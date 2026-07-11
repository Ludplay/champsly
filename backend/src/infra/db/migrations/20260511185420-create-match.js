'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phase_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'phases',
          key: 'id'
        }
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      round_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      player1_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      player2_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      winner_player_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      player1_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      player2_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('matches');
  }
};
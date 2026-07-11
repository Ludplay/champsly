
module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    phase_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    round_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    player1_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    player2_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    winner_player_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    player1_score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    player2_score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    modelName: 'Match',
    tableName: 'matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Model.associate = function(models) {
    Model.belongsTo(models.Phase, {
      foreignKey: 'phase_id',
      as: 'Phase'
    });

    Model.belongsTo(models.Player, {
      foreignKey: 'player1_id',
      as: 'Player1'
    });

    Model.belongsTo(models.Player, {
      foreignKey: 'player2_id',
      as: 'Player2'
    });
  };

  return Model;
};
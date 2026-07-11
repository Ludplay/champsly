

module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    extra: {
      type: DataTypes.STRING
    },
  }, {
    modelName: 'Player',
    tableName: 'players',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Player.associate = function(models) {
    Player.belongsToMany(models.Tournament, { 
      through: 'tournaments_players', 
      as: 'Tournaments',
      foreignKey: 'player_id',
      otherKey: 'tournament_id'
    });

    Player.belongsToMany(models.Group, {
      through: 'groups_players',
      as: 'Groups',
      foreignKey: 'player_id',
      otherKey: 'group_id'
    });
  };

  return Player;
};


module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Tournament', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    groups_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phases_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    modelName: 'Tournament',
    tableName: 'tournaments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Model.associate = function(models) {
    Model.belongsToMany(models.Player, { 
      through: 'tournaments_players', 
      as: 'Players',
      foreignKey: 'tournament_id',
      otherKey: 'player_id'
    });
  };

  return Model;
};
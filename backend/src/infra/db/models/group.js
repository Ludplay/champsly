

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Model.associate = function(models) {
    Model.belongsToMany(models.Player, {
      through: 'groups_players',
      as: 'Players',
      foreignKey: 'group_id',
      otherKey: 'player_id'
    });
  };

  return Model;
};

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Phase', {
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
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    modelName: 'Phase',
    tableName: 'phases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Model.associate = function(models) {
    Model.hasMany(models.Match, {
      foreignKey: 'phase_id',
      as: 'Matches'
    });

    Model.belongsTo(models.Tournament, {
      foreignKey: 'tournament_id',
      as: 'Tournaments'
    });
  };

  return Model;
};
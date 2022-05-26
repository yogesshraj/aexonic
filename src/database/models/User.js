const db = require(__dirname + '/../connection');

const Sequelize = db.Sequelize;
const sequelize = db.sequelize;

////////////////////////////////////////////////////////////////////////

const schema = {

  id: { type: Sequelize.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4, primaryKey: true }, 

  first_name: { type: Sequelize.STRING(50), allowNull: false },
  last_name: { type: Sequelize.STRING(50), allowNull: false },
  email: { type: Sequelize.STRING(15), allowNull: false },
  password: { type: Sequelize.STRING(256), allowNull: false },
  mobile: { type: Sequelize.STRING(15), allowNull: false },
  address: { type: Sequelize.STRING(256), allowNull: false },

  is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE
};

var tableName = 'users';
var modelName = 'User';

////////////////////////////////////////////////////////////////////////

module.exports.Model = sequelize.define(modelName, schema, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true,
    tableName: tableName
});
module.exports.Schema = schema;
module.exports.TableName = tableName;

const config = require("../configs/db");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  timezone: config.timezone,
  logging: false
}
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.js")(sequelize, Sequelize);
db.cadet = require("./cadet.js")(sequelize, Sequelize);
db.attendance = require("./attendance.js")(sequelize, Sequelize);
db.inventory = require("./inventory.js")(sequelize, Sequelize);
db.category = require("./category.js")(sequelize, Sequelize);
db.workstation = require("./workstation.js")(sequelize, Sequelize);

db.cadet.hasMany(db.attendance);
db.attendance.belongsTo(db.cadet);

db.category.hasMany(db.inventory)
db.inventory.belongsTo(db.category)

db.workstation.hasMany(db.inventory, { foreignkey: {allowNull: true}})
db.inventory.belongsTo(db.workstation)


// const RelyingParty_Group = sequelize.define('relyingParty_groups', {}, { timestamps: false });
// db.relyingParty.belongsToMany(db.group, { through: RelyingParty_Group });
// db.group.belongsToMany(db.relyingParty, { through: RelyingParty_Group });

// db.relyingParty_group = RelyingParty_Group

module.exports = db;

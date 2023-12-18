module.exports = (sequelize, Sequelize) => {
    const Cadet = sequelize.define("cadets", {
        npm: {
            type: Sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        fullname: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return Cadet;
};

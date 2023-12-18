module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: Sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return User;
};

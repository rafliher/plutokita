module.exports = (sequelize, Sequelize) => {
    const Attendance = sequelize.define("attendances", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        enterTime: {
            type: Sequelize.DATE,
            allowNull: false
        },
        leaveTime: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }, { timestamps: false });

    return Attendance;
};

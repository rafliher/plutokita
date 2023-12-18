module.exports = (sequelize, Sequelize) => {
    const Workstation = sequelize.define("workstations", {
        id: {
            type: Sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        isBooked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        location: {
            type: Sequelize.ENUM(['warnet','dewan','tengah'])
        }
    });

    return Workstation;
};

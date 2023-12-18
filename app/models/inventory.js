module.exports = (sequelize, Sequelize) => {
    const Inventory = sequelize.define("inventories", {
        id: {
            type: Sequelize.STRING,
            unique: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM(['rusak','baik'])
        },
        location: {
            type: Sequelize.ENUM(['warnet','dewan','lemari','tengah'])
        }
    });

    return Inventory;
};

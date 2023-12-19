module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("bookings", {
        startTime: {
            type: Sequelize.DATE,
            allowNull: false
        },
        endTime: {
            type: Sequelize.DATE,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM(['waiting', 'accepted', 'denied', 'done']),
            defaultValue: 'waiting'
        }
    });

    return Booking;
};

const { where } = require("sequelize")
const db = require("../models")

const Op = db.Sequelize.Op
const Cadet = db.cadet
const Booking = db.booking
const Workstation = db.workstation

const { validationResult } = require('express-validator')

exports.list = async (req, res) => {
    const { requestOnly, acceptedOnly, deniedAndAcceptedOnly } = req.query;

    // Define additional options for the query based on the requestOnly parameter
    const queryOptions = requestOnly === '1' ?
        { where: { status: 'waiting' } } :
            (acceptedOnly === '1' ?
                { where: { status: ['accepted', 'done'] } } : 
                (deniedAndAcceptedOnly === '1' ? 
                    { where: { status: ['accepted', 'denied'] } } : 
                    {}));

    try {
        const bookings = await Booking.findAll({
            include: [Cadet, Workstation],
            ...queryOptions,
        });

        return res.status(200).send({ data: bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { workstationId, cadetNpm, startTime, endTime } = req.body;
        
        const workstation = await Workstation.findByPk(workstationId);
        if (!workstation) {
            return res.status(404).json({ success: false, message: 'Workstation not found' });
        }
        if (workstation.isBooked) {
            return res.status(405).json({ success: false, message: 'Workstation is not available' });
        }

        const cadet = await Cadet.findByPk(cadetNpm);
        if (!cadet) {
            return res.status(404).json({ success: false, message: 'Cadet not found' });
        }

        const newBooking = await Booking.create({ workstationId, cadetNpm, startTime, endTime });

        return res.status(201).json({ success: true, data: newBooking, message: 'Booking request created successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { id, status } = req.params;

        const existingBooking = await Booking.findByPk(id);
        if (!existingBooking) {
            return res.status(404).json({ success: false, message: 'Booking request not found' });
        }
    
        const workstation = await Workstation.findByPk(existingBooking.workstationId);
        if (!workstation) {
            return res.status(404).json({ success: false, message: 'Workstation not found' });
        }
    
        existingBooking.status = status;
        await existingBooking.save();

        workstation.isBooked = status == 'accepted'? true:(status == 'done'? false : workstation.isBooked);
        await workstation.save();
    
        return res.status(200).json({ success: true, message: 'Booking updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getMonthlyBookingData = async (req, res) => {
    try {
        const { month, year } = req.query;

        const startDate = new Date(year, month - 1, 1); // Note: Month is 0-based
        const endDate = new Date(year, month, 0);

        const bookingData = await Booking.findAll({
            attributes: [
                [db.sequelize.literal('DATE(startTime)'), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.literal('DISTINCT `bookings`.`id`')), 'bookingCount']
            ],
            where: {
                startTime: {
                    [Op.between]: [startDate, endDate]
                },
                status: ['accepted', 'done']
            },
            group: ['date'],
            raw: true,
        });

        return res.status(200).json({ success: true, data: bookingData });
    } catch (error) {
        console.error('Error fetching monthly booking data:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

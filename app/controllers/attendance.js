const { where } = require("sequelize")
const db = require("../models")

const Op = db.Sequelize.Op
const Cadet = db.cadet
const Attendance = db.attendance

const { validationResult } = require('express-validator')

exports.check = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() });
    }

    try {
        // Check if cadet with npm exists
        const cadet = await Cadet.findOne({ where: { npm: req.body.npm } });
        if (!cadet) {
            return res.status(404).send({ message: "NPM tidak ditemukan" });
        }

        // Check if there is an attendance record with cadetNpm and leaveTime is null
        const attendance = await Attendance.findOne({ where: { cadetNpm: req.body.npm, leaveTime: null } });

        if (attendance) {
            return res.status(200).send({ isAttending: true });
        } else {
            return res.status(200).send({ isAttending: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.attend = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() });
    }

    try {
        const cadet = await Cadet.findOne({ where: { npm: req.body.npm } });
        if (!cadet) {
            return res.status(404).send({ message: "NPM tidak ditemukan" });
        }

        // Insert into Attendance with cadetNpm and enterTime
        const result = await Attendance.create({
            cadetNpm: req.body.npm,
            enterTime: new Date()
        });

        // Check if the insertion was successful
        if (result) {
            console.log(`[absen masuk][${new Date()}] ${req.body.npm} masuk lab`);
            return res.status(200).send({ success: true, fullname: cadet.fullname });
        } else {
            return res.status(200).send({ success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.delete = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() });
    }

    try {
        const cadet = await Cadet.findOne({ where: { npm: req.body.npm } });
        if (!cadet) {
            return res.status(404).send({ message: "NPM tidak ditemukan" });
        }
        
        // Update the leaveTime for the corresponding cadetNpm and enterTime is null
        const result = await Attendance.update(
            { leaveTime: new Date() },
            {
                where: {
                    cadetNpm: req.body.npm,
                    leaveTime: null // Ensure we are updating only if leaveTime is null
                }
            }
        );

        // Check if the update was successful
        if (result[0] > 0) {
            console.log(`[absen keluar][${new Date()}] ${req.body.npm} keluar lab`);
            return res.status(200).send({ success: true, fullname: cadet.fullname });
        } else {
            return res.status(200).send({ success: false, message: "No record to update" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.list = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Invalid input", errors: errors.array() });
    }

    try {
        // Get parameters from the request
        const { date, attendingOnly, allTime } = req.query;

        // Build the query options based on the parameters
        const queryOptions = {
            where: {},
            include: {
                model: Cadet
            }
        };

        if (!allTime || allTime === '0') {
            if (date) {
                // If date is provided, search for data on the given date only
                let dateVal = new Date(date)
                let nextDate = new Date()
                nextDate.setTime(dateVal.getTime() + (1000 * 60 * 60 * 24))
                queryOptions.where.enterTime = {
                    [Op.gte]: dateVal,
                    [Op.lt]: nextDate
                };
            } else {
                // If date is not provided, set for the current date
                const today = new Date();
                let dateVal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                let nextDate = new Date()
                nextDate.setTime(dateVal.getTime() + (1000 * 60 * 60 * 24))
                queryOptions.where.enterTime = {
                    [Op.gte]: dateVal,
                    [Op.lt]: nextDate
                };
            }
    
            if (attendingOnly && attendingOnly === '1') {
                // If attendingOnly is set to 1, return only where leavetime is null
                queryOptions.where.leaveTime = null;
            }
    
            // Check if attendingOnly parameter is not allowed when date is set
            if (date && attendingOnly && attendingOnly === '1') {
                return res.status(400).json({ message: "Parameter 'attendingOnly' is not allowed when 'date' is set." });
            }
        }

        // Fetch attendance data based on the query options
        const attendances = await Attendance.findAll(queryOptions);

        // Send the attendance data in the response
        return res.status(200).json({ data: attendances });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.summary = async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();

        // Calculate the start of the current month
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Fetch data for the summary
        const totalVisitorToday = await Attendance.count({
            where: {
                enterTime: {
                    [Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                    [Op.lt]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
                }
            }
        });

        const totalVisitorThisMonth = await Attendance.count({
            where: {
                enterTime: {
                    [Op.gte]: startOfMonth,
                    [Op.lt]: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                }
            }
        });

        const currentlyAttending = await Attendance.count({
            where: {
                enterTime: {
                    [Op.gte]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                    [Op.lt]: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
                },
                leaveTime: null
            }
        });

        // Send the summary data in the response
        return res.status(200).json({
            totalVisitorToday: totalVisitorToday,
            totalVisitorThisMonth: totalVisitorThisMonth,
            currentlyAttending: currentlyAttending
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

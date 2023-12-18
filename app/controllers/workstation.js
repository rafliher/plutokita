const { validationResult } = require('express-validator');
const db = require('../models');
const Workstation = db.workstation;

exports.list = async (req, res) => {
    try {
        const workstations = await Workstation.findAll();
        return res.status(200).json({ data: workstations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { id, location } = req.body;

        const newWorkstation = await Workstation.create({ id, location });

        return res.status(201).json({ success: true, data: newWorkstation, message: 'Workstation created successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { location } = req.body;

        // Validate if location is provided
        if (!location) {
            return res.status(400).json({ success: false, message: 'Location is required for update.' });
        }

        const result = await Workstation.update(
            { location: location },
            {
                where: {
                    id: id,
                },
            }
        );

        if (result && result[0] > 0) {
            return res.status(200).json({ success: true, message: `Workstation with ID ${id} has been updated.` });
        } else {
            return res.status(404).json({ success: false, message: `Workstation with ID ${id} not found.` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { id } = req.params;

        const result = await Workstation.destroy({
            where: {
                id: id,
            },
        });

        if (result) {
            return res.status(200).json({ success: true, message: `Workstation with ID ${id} has been deleted.` });
        } else {
            return res.status(404).json({ success: false, message: `Workstation with ID ${id} not found.` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

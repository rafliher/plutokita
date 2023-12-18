const { where } = require("sequelize")
const db = require("../models")

const Op = db.Sequelize.Op
const Cadet = db.cadet

const { validationResult } = require('express-validator')
const xlsx = require('xlsx');
const fs = require('fs-extra');

exports.list = async (req, res) => {
    const cadets = await Cadet.findAll();
    return res.status(200).send({ data: cadets });
};

exports.bulkCreate = async (req, res) => {
    const { file } = req;
    try {

        if (!file || !file.mimetype.includes('sheet')) {
            return res.status(400).json({ error: 'Invalid file format. Please upload an Excel file.' });
        }

        const cadetData = [];

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        data.forEach((row) => {
            const npm = row.npm;
            const fullname = row.fullname;

            const existingCadet = cadetData.find(cadet => cadet.npm === npm);

            if (existingCadet) {
                existingCadet.fullname = fullname;
            } else {
                cadetData.push({ npm, fullname });
            }
        });

        await Cadet.bulkCreate(cadetData, { updateOnDuplicate: ["fullname"] });
        
        fs.unlinkSync(`uploads/${file.filename}`);

        res.status(200).json({ message: 'Cadet data updated/created successfully.' });
    } catch (error) {
        console.error(error);
        fs.unlinkSync(`uploads/${file.filename}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }

    try {
        const { npm } = req.params;
        const { fullname } = req.body;

        // Validate if fullname is provided
        if (!fullname) {
            return res.status(400).json({ success: false, message: 'Fullname is required for update.' });
        }

        const result = await Cadet.update(
            { fullname: fullname },
            {
                where: {
                    npm: npm
                }
            }
        );

        if (result && result[0] > 0) {
            return res.status(200).json({ success: true, message: `Cadet with NPM ${npm} has been updated.` });
        } else {
            return res.status(404).json({ success: false, message: `Cadet with NPM ${npm} not found.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.destroy = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() })
    }
    try {
        const { npm } = req.params;

        const result = await Cadet.destroy({
            where: {
                npm: npm
            }
        });

        if (result) {
            return res.status(200).json({ success: true, message: `Cadet with NPM ${npm} has been deleted.` });
        } else {
            return res.status(404).json({ success: false, message: `Cadet with NPM ${npm} not found.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

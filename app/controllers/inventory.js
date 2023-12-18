const { where } = require("sequelize")
const db = require("../models")

const Op = db.Sequelize.Op
const Inventory = db.inventory
const Category = db.category
const Workstation = db.workstation

const { validationResult } = require('express-validator')
const xlsx = require('xlsx');
const fs = require('fs-extra');

exports.list = async (req, res) => {
    const inventories = await Inventory.findAll({include: [Category, Workstation]});
    return res.status(200).send({ data: inventories });
};

exports.bulkCreate = async (req, res) => {
    const { file } = req;
    try {

        if (!file || !file.mimetype.includes('sheet')) {
            return res.status(400).json({ error: 'Invalid file format. Please upload an Excel file.' });
        }

        const categories = await Category.findAll()
        let categoryDict = {}
        categories.forEach(category => {
            categoryDict[category.name.toLowerCase()] = category.id
        })

        const invetoryData = [];

        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        data.forEach((row) => {
            const id = row.id;
            const name = row.name;
            const categoryId = categoryDict[row.category.toLowerCase()];
            const status = row.status;
            const location = row.location;

            const existingInventory = invetoryData.find(inventory => inventory.id === id);

            if (existingInventory) {
                existingInventory.name = name;
                existingInventory.categoryId = categoryId;
                existingInventory.status = status;
                existingInventory.location = location;
            } else {
                invetoryData.push({ id, name, categoryId, status, location });
            }
        });

        await Inventory.bulkCreate(invetoryData, { updateOnDuplicate: ["name", "categoryId", "status", "location"] });
        
        fs.unlinkSync(`uploads/${file.filename}`);

        res.status(200).json({ message: 'Inventory data updated/created successfully.' });
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

    const { id } = req.params; // Assuming the inventory ID is in the URL parameters
    const { name, categoryId, status, location } = req.body;
    
    try {
        // Check if the inventory with the specified ID exists
        const existingInventory = await Inventory.findByPk(id);
    
        if (!existingInventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }
    
        // Update the inventory fields
        existingInventory.name = name;
        existingInventory.categoryId = categoryId;
        existingInventory.status = status;
        existingInventory.location = location;
    
        // Save the updated inventory to the database
        await existingInventory.save();
    
        return res.status(200).json({ success: true, message: 'Inventory updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
};

exports.destroy = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() })
    }
    try {
        const { id } = req.params;

        const result = await Inventory.destroy({
            where: {
                id: id
            }
        });

        if (result) {
            return res.status(200).json({ success: true, message: `Inventory with id ${id} has been deleted.` });
        } else {
            return res.status(404).json({ success: false, message: `Inventory with id ${id} not found.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

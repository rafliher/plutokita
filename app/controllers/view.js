const db = require("../models");

const Op = db.Sequelize.Op;

const { validationResult } = require('express-validator');

exports.signin = (req, res) => {
    res.render('signin');
}

exports.main = (req, res) => {
    res.render('main', {});
};

exports.book = (req, res) => {
    res.render('book', {});
};

exports.dashboard = (req, res) => {
    res.render('dashboard');
};

exports.attendance = (req, res) => {
    res.render('attendance');
};

exports.bookRequest = (req, res) => {
    res.render('bookRequest');
};

exports.bookData = (req, res) => {
    res.render('bookData');
};

exports.cadetManagement = (req, res) => {
    res.render('cadetManagement');
};

exports.inventoryManagement = (req, res) => {
    res.render('inventoryManagement');
};

exports.workstationManagement = (req, res) => {
    res.render('workstationManagement');
};

exports.error = (req, res) => {
    res.render('error', {
        message: req.query.message
    });
};

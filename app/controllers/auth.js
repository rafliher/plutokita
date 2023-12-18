const db = require("../models");
const config = require("../configs/auth");
require('dotenv').config()

const User = db.user;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

exports.signin = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() })
    }
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "Invalid username or password" });
        }
        let passwordValid = bcrypt.compareSync(req.body.password + req.body.username, user.password, 10)
        if (!passwordValid) {
            return res.status(404).send({ message: "Invalid username or password" });
        }
        const token = jwt.sign({username: req.body.username}, config.secret, {
            expiresIn: req.body.rememberme == '1' ? 1209600 : 3600 // 14 days or 1 hour
        });
        return res.status(200).send({ accessToken: token });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.resetPassword = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).send({ message: "Invalid input", errors: errors.array() })
    }
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        User.update({
            password: bcrypt.hashSync(process.env.DEFAULT_PASSWORD + req.body.username, 10)
        }, {
            where: { username: req.body.username }
        }).then(user => {
            console.log(`[auth password reset][${new Date()}] ${req.username} reset password of ${req.body.username}`);
            res.send({ message: "Password reset successfully!" });
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};
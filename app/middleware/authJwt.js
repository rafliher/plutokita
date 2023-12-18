const jwt = require("jsonwebtoken");
const config = require("../configs/auth.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers.authorization || req.cookies.authorization;
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    token = token.split(' ')[1];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.user = decoded;
        next();
    });
};

verifyTokenFromCookies = (req, res, next) => {
    let token = req.cookies.authorization;
    if (!token) {
        return res.redirect("/signin");
    }

    token = token.split(' ')[1];

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.redirect("/signin");
        }
        req.user = decoded;
        next();
    });
};

const authJwt = {
    verifyToken: verifyToken,
    verifyTokenFromCookies: verifyTokenFromCookies,
};
module.exports = authJwt;

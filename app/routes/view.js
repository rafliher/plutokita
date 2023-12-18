const controller = require("../controllers/view");
const { authJwt } = require("../middleware");
const { body } = require('express-validator');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/signin', controller.signin);

    app.get("/", controller.main);

    app.get("/admin", [
        authJwt.verifyTokenFromCookies
    ], controller.dashboard);

    app.get("/attendance", [
        authJwt.verifyTokenFromCookies
    ], controller.attendance);

    app.get("/cadetmanagement", [
        authJwt.verifyTokenFromCookies
    ], controller.cadetManagement);

    app.get("/inventorymanagement", [
        authJwt.verifyTokenFromCookies
    ], controller.inventoryManagement);

    app.get("/workstationmanagement", [
        authJwt.verifyTokenFromCookies
    ], controller.workstationManagement);

    app.get("/error", controller.error);
};

const controller = require("../controllers/auth");
// const { authJwt, role } = require("../middleware");
const { body, query } = require('express-validator');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post('/api/auth/signin', [
        body('username').isLength({min:1}),
        body('password').isLength({min:1}),
    ], controller.signin);
};

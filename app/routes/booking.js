const controller = require("../controllers/booking");
const { authJwt } = require("../middleware");
const { body, query, param } = require('express-validator');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/api/booking', [
        authJwt.verifyToken
    ], controller.list);

    app.post('/api/booking', [
        body('workstationId').notEmpty().isString(),
        body('cadetNpm').notEmpty().isNumeric(),
        body('startTime').notEmpty().isISO8601(),
        body('endTime').notEmpty().isISO8601(),
    ], controller.create);

    app.patch('/api/booking/:id/status/:status', [
        param('id').isInt().withMessage('Booking ID must be an integer'),
        param('status').isIn(['accepted', 'denied', 'done']).withMessage('Invalid status. It must be either "accepted" or "denied"'),
    ], controller.updateStatus);

};

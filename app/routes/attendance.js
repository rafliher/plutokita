const controller = require("../controllers/attendance");
const { authJwt } = require("../middleware");
const { body, query } = require('express-validator');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post('/api/attendance/check', [
        body('npm').isNumeric()
    ], controller.check);
    
    app.post('/api/attendance', [
        body('npm').isNumeric()
    ], controller.attend);

    app.delete('/api/attendance', [
        body('npm').isNumeric()
    ], controller.delete);

    app.get('/api/attendance', [
        query('date').optional().isISO8601().toDate(),
        query('attendingOnly').optional().isIn(['0', '1']),
        query('allTime').optional().isIn(['0', '1']),
    ], controller.list);
    
    app.get('/api/attendance/summary', [
        query('date').optional().isISO8601().toDate(),
    ], controller.summary);

    app.get('/api/attendance/monthly', [
        authJwt.verifyToken
    ], controller.getMonthlyAttendance);
};

const workstationController = require('../controllers/workstation');
const { authJwt } = require('../middleware');
const { body, param } = require('express-validator');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get('/api/workstation', [authJwt.verifyToken], workstationController.list);

    app.post('/api/workstation', [
        authJwt.verifyToken,
        body('id').isLength({ min: 1 }),
        body('location').isLength({ min: 1 })
    ], workstationController.create);

    app.patch('/api/workstation/:id', [
        authJwt.verifyToken,
        param('id').isLength({ min: 1 }),
        body('location').isLength({ min: 1 }),
    ], workstationController.update);

    app.delete('/api/workstation/:id', [authJwt.verifyToken, param('id').isNumeric()], workstationController.destroy);
};

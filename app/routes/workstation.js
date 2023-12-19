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

    app.get('/api/workstation', workstationController.list);

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

    app.delete('/api/workstation/:id', [
        authJwt.verifyToken,
        param('id').isLength({ min: 1 })
    ], workstationController.destroy);

    // Get associated inventories for a workstation
    app.get('/api/workstation/:id/inventories', [
        param('id').isLength({ min: 1 })
    ], workstationController.getAssociatedInventories);

    // Add associated inventory to a workstation
    app.post('/api/workstation/:id/inventories', [
        authJwt.verifyToken,
        param('id').isLength({ min: 1 }),
        body('inventoryId').notEmpty().isString(),
    ], workstationController.addAssociatedInventory);

    // Remove associated inventory from a workstation
    app.delete('/api/workstation/:id/inventories/:inventoryId', [
        authJwt.verifyToken,
        param('id').isLength({ min: 1 }),
        param('inventoryId').isLength({ min: 1 })
    ], workstationController.removeAssociatedInventory);

};

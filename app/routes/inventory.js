const controller = require("../controllers/inventory");
const { authJwt } = require("../middleware");
const { body, query, param } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/api/inventory', [
        authJwt.verifyToken
    ], controller.list);

    app.post('/api/inventory', upload.single('inventoryXlsx'), [
        authJwt.verifyToken
    ], controller.bulkCreate)
    
    app.patch('/api/inventory/:id', [
        authJwt.verifyToken,
        param('id').isLength({min: 1}),
        body('name').isLength({ min: 1 }),
        body('categoryId').isNumeric(),
        body('status').isLength({ min: 1 }),
        body('location').isLength({ min: 1 }),
    ], controller.update)

    app.delete('/api/inventory/:id', [
        authJwt.verifyToken,
        param('id').isLength({min: 1})
    ], controller.destroy)
};

const controller = require("../controllers/cadet");
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

    app.get('/api/cadet', [
        authJwt.verifyToken
    ], controller.list);

    app.post('/api/cadet', upload.single('cadetCsv'), [
        authJwt.verifyToken
    ], controller.bulkCreate)
    
    app.patch('/api/cadet/:npm', [
        authJwt.verifyToken,
        param('npm').isNumeric(),
        body('fullname').isLength({min: 1})
    ], controller.update)

    app.delete('/api/cadet/:npm', [
        authJwt.verifyToken,
        param('npm').isNumeric()
    ], controller.destroy)
};

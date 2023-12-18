const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');

require('dotenv').config()

const corsOptions = {
	origin: 'http://localhost',
	'Access-Control-Allow-Origin': 'http://localhost',
	withCredentials: false,
	'access-control-allow-credentials': true,
	credentials: false,
	optionSuccessStatus: 200,
}

const app = express();

app.use(cors()); //corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(cookieParser());

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

const db = require("./app/models");

// db.sequelize.sync({ force: true }).then(() => {
// //     console.log('Drop and Resync Db');
// try {
db.sequelize.sync().then(() => {
	initial();
}).catch(err => {
	console.log(err.message);
});
// } catch (e) {
//     console.log(e);
// }

app.use(express.static(path.join(__dirname, 'public')));
require('./app/routes/view')(app);
require('./app/routes/attendance')(app);
require('./app/routes/auth')(app);
require('./app/routes/cadet')(app);
require('./app/routes/inventory')(app);
require('./app/routes/workstation')(app);

if(process.env.SSL_MODE == 'ON'){
	const https_options = {
		key: fs.readFileSync(process.env.SSL_KEYPATH),
		cert: fs.readFileSync(process.env.SSL_CERTPATH),
		ca: [
			fs.readFileSync(process.env.SSL_CERTPATH),
			fs.readFileSync(process.env.SSL_CABUNDLEPATH)
		]
	};

	const HTTPSPORT = process.env.HTTPS_PORT || 443;
	const server = https.createServer(https_options, app).listen(HTTPSPORT, process.env.IP || '127.0.0.2', () => {
		console.log(`Https server is running on port ${HTTPSPORT}.`);
	});
}

const PORT = process.env.HTTP_PORT || 80;
const HOST = process.env.IP || '127.0.0.2'
app.listen(PORT, HOST, () => {
	console.log(`Server is running on  http://${HOST}:${PORT}.`);
});

const User = db.user
const Category = db.category
const bcrypt = require("bcryptjs");

async function initial() {
	const userCount = await User.findAndCountAll();
    
    if (userCount.count === 0) {
        // Insert the default account if the table is empty
        
		await User.create({
			username: "admin",
            password: bcrypt.hashSync(process.env.DEFAULT_PASSWORD + "admin", 10)
		});
        console.log('Default account inserted successfully.');
	}
	
	const categoryCount = await Category.findAndCountAll();
    
    if (categoryCount.count === 0) {
        // Insert the default account if the table is empty
        
		await Category.bulkCreate([
			{name: "Keyboard"},
			{name: "Mouse"},
			{name: "CPU"},
			{name: "Monitor"},
			{name: "UPS"},
		]);
        console.log('Default category inserted successfully.');
    }
}

process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

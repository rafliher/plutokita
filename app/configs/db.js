require('dotenv').config()

module.exports = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_DATABASE,
    dialect: "mysql",
    dialectOptions: {
        dateStrings: true,
        typeCast: true
    },
    timezone: '+07:00' //for writing to database
};
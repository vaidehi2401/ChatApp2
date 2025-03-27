require('dotenv').config();
console.log("DB_NAME:", process.env.DB_NAME); 
console.log("DB_USER:", process.env.DB_USER); // Debugging
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "Exists" : "Not found"); // Debugging

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        pool: {
            max: 100,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

module.exports = sequelize;

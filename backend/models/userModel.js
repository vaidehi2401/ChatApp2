const {Sequelize, DataTypes}= require('sequelize');
const sequelize = require('../util/database');
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}
,
{
    timestamps: true  
}
)
module.exports=User;
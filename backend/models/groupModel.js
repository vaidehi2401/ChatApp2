// models/groupModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Group;

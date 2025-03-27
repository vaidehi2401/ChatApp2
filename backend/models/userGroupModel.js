// models/userGroupModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userModel');
const Group = require('./groupModel');

const UserGroup = sequelize.define('UserGroup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member' // or 'admin'
  }
}, {
  timestamps: true,
});
UserGroup.belongsTo(User, { foreignKey: 'userId' });
UserGroup.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = UserGroup;

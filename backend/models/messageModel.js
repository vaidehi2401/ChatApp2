// models/messageModel.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userModel');
const Group = require('./groupModel');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Group,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: true
});

// Associations
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(Message, { foreignKey: 'groupId' });
Message.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Message;

const Message = require('../models/messageModel');
const Users = require('../models/userModel');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
const uploadToS3 = require('../services/S3services')
const multer = require('multer')

exports.postMessage = async (req, res) => {
    try {
        // Extract message and userId from the request
        const  message  = req.body.message;
        const groupId = req.body.groupId;
        const userId = req.user.dataValues.id;
        if (!message || !userId) {
            return res.status(400).json({ error: "Message content and user ID are required." });
        }

        // Save the message to the database
        const newMessage = await Message.create({
            content: message,
            userId: userId,
            groupId:groupId
        });
        const sender = await Users.findByPk(userId, {
            attributes: ['id', 'name']
        });
        const messageData={
            id: newMessage.id,
            sender : sender.name, 
            senderId: sender.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            groupId: groupId || null
        }
        console.log(messageData)
      const io = req.app.get('io');
      if(groupId){
        io.to(`group_${groupId}`).emit('newMessage', {
            ...messageData,
            sender: sender.id === userId ? "You": sender.name
        });
        console.log(messageData, "Sent>>>>>>")
      }
      else{
        io.emit('newMessage', messageData)
        console.log(messageData, "Sent>>>>>>1")
      }
        // Return success response
        res.status(201).json({
            message: "Message successfully saved.",
            data: newMessage
        });
        console.log("sent>>>>>>>>>>>>>>>>>>>>")
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};
//const sequelize = require('../util/database'); // Import Sequelize instance

exports.getMessages = async (req, res) => {
    const userId = req.user.dataValues.id;
    const lastId = req.params.lastId;
    const groupId = req.params.groupId;
    console.log(">>>>>>>>>>>>>getting", groupId)

    try {
        let query, replacements;

        if (groupId === 'null') {
            // Fetch messages that don't belong to any group
            query = `
                SELECT u.id AS senderId, u.name AS sender, m.id, m.content, m.createdAt
                FROM users u
                JOIN messages m ON u.id = m.userId
                WHERE m.id > ? AND m.groupId IS NULL
                ORDER BY m.createdAt ASC
            `;
            replacements = [lastId];
        } else {
            // Fetch messages that belong to a specific group
            query = `
                SELECT u.id AS senderId, u.name AS sender, m.id, m.content, m.createdAt
                FROM users u
                JOIN messages m ON u.id = m.userId
                WHERE m.id > ? AND m.groupId = ?
                ORDER BY m.createdAt ASC
            `;
            replacements = [lastId, groupId];
        }

        const messages = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
            replacements
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            sender: msg.senderId === userId ? "You" : msg.sender,
            content: msg.content,
            createdAt: msg.createdAt
        }));

        res.status(200).json({ messages: formattedMessages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};
exports.uploadFiles = async (req, res) => {
    try {
      const file = req.file;
      const groupId = req.body.groupId;
      const userId = req.user.id;
  
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const filename = `${Date.now()}-${file.originalname}`;
      const fileUrl = await uploadToS3(file.buffer, filename);
  
      // Save the S3 URL as a message
      const newMessage = await Message.create({
        content: fileUrl,
        userId,
        groupId
      });
  
      const sender = await Users.findByPk(userId, {
        attributes: ['id', 'name']
      });
  
      const messageData = {
        id: newMessage.id,
        sender: "You", // Optional: handle dynamic naming
        senderId: sender.id,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        groupId
      };
  
      const io = req.app.get('io');
      if (groupId) {
        io.to(`group_${groupId}`).emit('newMessage', messageData);
      } else {
        io.emit('newMessage', messageData);
      }
  
      res.status(200).json({ message: "File uploaded", fileUrl });
  
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload file" });
    }
  };
  
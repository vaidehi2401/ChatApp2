const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const cors = require('cors');
const sequelize = require('./util/database');
const archievedModel = require('./models/archievedModel')
const userModel = require('./models/userModel')
const userGroupModel = require('./models/userGroupModel')
const messagesModel = require('./models/messageModel')
const groupModel = require('./models/groupModel')
const cron = require('node-cron');
const archiveOldMessages = require('./jobs/archiveMessages.');
const app = express();
const server = http.createServer(app);

// Initialize socket.io after creating the server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Now you can set io on app
app.set('io', io);
cron.schedule('0 2 * * *', archiveOldMessages);
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  socket.on('joinGroup', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User joined group ${groupId}`);
  });

  socket.on('leaveGroup', (groupId) => {
    socket.leave(`group_${groupId}`); // Fixed template literal
    console.log(`User left group ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/users', userRoutes);
app.use('/group', groupRoutes);

// Database sync and server start
sequelize.sync({force:true})
  .then(() => {
    const PORT = process.env.PORT_NO || 3004; // Default port if not specified
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
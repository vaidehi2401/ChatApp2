// middlewares/multer.js
const multer = require('multer');

// Store the uploaded file in memory (not on disk)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;

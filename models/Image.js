const mongoose = require("mongoose");

// Schema for image

const image = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = image;

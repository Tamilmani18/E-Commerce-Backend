const mongoose = require("mongoose");

// Schema for image

const image = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    data:{
      type: Buffer,
      required: true, 
    },
    contentType: {
      type: String,
      required: true,
    },
  },
});

module.exports = image;

const mongoose = require('mongoose');

const errorHandlerSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 500
  },
  error: {
    type: String,
    required: true
  }
});

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = { ApiError, errorHandlerSchema };

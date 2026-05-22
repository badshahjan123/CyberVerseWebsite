const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Track', trackSchema);

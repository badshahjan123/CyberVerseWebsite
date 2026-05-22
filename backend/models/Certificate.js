const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  credentialId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  verificationHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['issued', 'revoked'],
    default: 'issued'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);

const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  result: {
    type: String,
    enum: ['VALID', 'INVALID_QR', 'TAMPERED_QR', 'ALREADY_USED', 'NOT_FOUND'],
    required: true
  },
  details: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ScanLog', scanLogSchema);

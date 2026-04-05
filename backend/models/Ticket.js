const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true
  },
  vehicleNumber: { 
    type: String, 
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  vehicleType: { 
    type: String, 
    enum: ['Bike', 'Scooter'], 
    default: 'Bike',
    required: true
  },
  entryTime: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  exitTime: { 
    type: Date 
  },
  duration: { 
    type: Number, 
    default: 0 // Duration in minutes
  },
  fee: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'COMPLETED'], 
    default: 'ACTIVE' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED'], 
    default: 'PENDING' 
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Net Banking', 'Cash']
  },
  paidAt: {
    type: Date
  },
  qrCodeData: { 
    type: String 
  },
  issuedAt: {
    type: Number, // Timestamp
    required: true
  },
  signature: {
    type: String
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  whatsappStatus: {
    type: String,
    enum: ['SENT', 'FAILED', 'PENDING'],
    default: 'PENDING'
  },
  pdfUrl: {
    type: String
  }
}, { timestamps: true });

// Ensure only one ACTIVE ticket per vehicle at a time
ticketSchema.index(
  { vehicleNumber: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

// Method to calculate duration and fee upon exit
ticketSchema.methods.calculateClosure = function() {
  if (!this.exitTime) return;

  const diffMs = this.exitTime - this.entryTime;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Round up to nearest hour
  
  this.duration = Math.floor(diffMs / (1000 * 60)); // Minutes for logging
  this.fee = diffHours * 10; // ₹10 per hour
  this.status = 'COMPLETED';
  return this.fee;
};


ticketSchema.pre('save', async function() {
  if (this.isNew && !this.qrCodeData) {
    this.qrCodeData = `SRI ANNA|${this.ticketId}|${this.vehicleNumber}`;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);

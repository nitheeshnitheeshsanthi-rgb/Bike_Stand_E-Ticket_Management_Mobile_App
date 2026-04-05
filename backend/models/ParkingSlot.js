const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: { 
    type: String, 
    unique: true, 
    required: true,
    enum: [
      'A01', 'A02', 'A03', 'A04', 'A05',
      'B01', 'B02', 'B03', 'B04', 'B05'
    ]
  },
  isOccupied: { 
    type: Boolean, 
    default: false 
  },
  vehicleNumber: { 
    type: String, 
    uppercase: true,
    required: false // Only required if occupied
  },
  ticketId: { 
    type: String, 
    required: false // Only required if occupied
  }
}, { timestamps: true });

// Auto-clean slot logic if isOccupied is set to false
parkingSlotSchema.pre('save', async function() {
  if (!this.isOccupied) {
    this.vehicleNumber = undefined;
    this.ticketId = undefined;
  }
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);

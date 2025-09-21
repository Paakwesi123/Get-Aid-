const mongoose = require('mongoose');   // <-- keep this only ONCE

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamType: { type: String, enum: ['fire', 'police', 'ambulance'], required: true },
  teamNumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  location: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

// ✅ Virtual field for teamId (e.g., "Team-6")
teamSchema.virtual('teamId').get(function () {
  return `Team-${this.teamNumber}`;
});

teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);

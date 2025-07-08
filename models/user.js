const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  phoneNumber: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    unique: true,  // This creates the index automatically
    validate: {
      validator: function(v) {
        return /^\d{10,15}$/.test(v);
      },
      message: 'Phone number must be 10-15 digits'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  medicalHistory: {
  type: Object,
  default: {
    allergies: '',
    chronicDiseases: '',
    bloodType: '',
    medications: '',
    previousSurgeries: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  }
},

  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Remove this line if you have it - it's causing the duplicate:
// userSchema.index({ phoneNumber: 1 });

// Don't return password in JSON responses
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
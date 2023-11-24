import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: String,
  email: String,
  age: Number,
  gender: String,
  isAnonymous: Boolean,
  isNewUser: Boolean,
  createdAt: Number,
  updatedAt: Number,
  loginAttempt: {
    otp: Number,
    timestamp: Number
  }
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;


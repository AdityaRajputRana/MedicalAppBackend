import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: String,
  age: Number,
  gender: String,
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;


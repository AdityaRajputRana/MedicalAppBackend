import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient: mongoose.Schema.ObjectId,
  case: mongoose.Schema.ObjectId,
  hospitalId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;


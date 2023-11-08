import mongoose, { mongo } from "mongoose";

const caseSchema = new mongoose.Schema({
  patientId: String,
  patient: {
    id: String,
    mobileNumber: Number,
    fullName: String,
    gender: String,
    email: String
  },
  mobileNumber: Number,
  email: String,
  hospitalId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId,
  creatorId: mongoose.Schema.ObjectId
});

const Case = mongoose.model('Case', caseSchema);

export default Case;


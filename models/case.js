import mongoose, { mongo } from "mongoose";

const caseSchema = new mongoose.Schema({
  patientId: String,
  firstVisit: Number,
  hospitalId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId
});

const Case = mongoose.model('Case', caseSchema);

export default Case;


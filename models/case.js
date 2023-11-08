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
  updatedAt: Number,
  hospitalId: String,
  fullName: String,
  gender: String,
  doctorId: mongoose.Schema.ObjectId,
  creatorId: mongoose.Schema.ObjectId,
  pageCount: Number,
  previewImg: String,

  createdAt: Number,
  updatedAt: Number
});

const Case = mongoose.model('Case', caseSchema);

export default Case;


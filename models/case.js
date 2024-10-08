import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  patientId: String,
  hospitalPatientId: String,
  isOpen: Boolean,
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
  updatedAt: Number,

  pageNumbers: [Number],

  additionals:[],

  pdf: {
    publicUrl: String,
    updatedAt: Number
  },
  pdfTask: {
    jobId: String,
    status: String,
    updatedAt: Number,
    error: String,
    message: String
  },
});

const Case = mongoose.model('Case', caseSchema);

export default Case;


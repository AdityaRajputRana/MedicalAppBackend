import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  patientId: String, //Todo: Update this to Object id with Reference
  hospitalPatientId: String,
  hospitalId: String, //Todo: Update this to Object id with Reference
  caseId: String,
  creatorId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId,
  createdAt: Number,
  updatedAt: Number,
  pageNumber: Number,
  width: Number,
  height: Number,
  pageType: String,
  mobileNumber: Number,
  fullName: String,
  email: String,
  gender: String,
  points: [
    {
      x: Number,
      y: Number,
      actionType: Number
    }
  ]
});

const Page = mongoose.model('Page', pageSchema);

export default Page;


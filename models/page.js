import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  patientId: String, //Todo: Update this to Object id with Reference
  hospitalId: String, //Todo: Update this to Object id with Reference
  creatorId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId,
  createdAt: Number,
  updatedAt: Number,
  pageNumber: Number,
  width: Number,
  height: Number,
  pageType: String,
  mobileNumber: Number,
  points: [
    {
      x: Number,
      y: Number
    }
  ]
});

const Page = mongoose.model('Page', pageSchema);

export default Page;


import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  patientId: String,
  firstVisit: Number,
  hospitalId: mongoose.Schema.ObjectId,
  doctorId: mongoose.Schema.ObjectId,
  pageNumber: Number,
  width: Number,
  height: Number,
  points: [
    {
      x: Number,
      y: Number
    }
  ]
});

const Page = mongoose.model('Page', pageSchema);

export default Page;


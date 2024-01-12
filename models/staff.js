import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  fullName: String,
  firstName: String,
  lastName: String,
  mobileNumber: Number,
  email: String,
  password: String,
  displayPicture: String,
  type: String,
  title: String,
  hospital: {
    _id: String,
    name: String,
  },
});

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;

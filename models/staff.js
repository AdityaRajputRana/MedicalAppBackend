import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  fullName: String,
  firstName: String,
  lastName: String,
  mobileNumber: Number,
  email: String,
  password: String, // This should be securely hashed
  displayPicture: String,
  type: String,
  title: String,
  hospital: {
    _id: String, // Todo: Set to Hospital ID soon
    name: String,
  },
});

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;

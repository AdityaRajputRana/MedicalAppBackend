import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    patientId: String,
    mobileNumber: Number,
    fullName: String,
    gender: String,
    email: String,
    user: Number,
    age: Number,
    updatedAt: Number,
    createdAt: Number,
    lastVisit: Number,
    hospitalId: String,
    doctorId: mongoose.Schema.ObjectId,
    creatorId: mongoose.Schema.ObjectId,
    searchIndex: String
});

patientSchema.pre('save', function (next) {
    this.searchIndex = this.fullName + " " + this.mobileNumber;
    next();
});
const HospitalsPatient = mongoose.model('HospitalsPatient', patientSchema);

export default HospitalsPatient;


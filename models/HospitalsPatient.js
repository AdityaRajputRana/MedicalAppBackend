import mongoose, { mongo } from "mongoose";

const patientSchema = new mongoose.Schema({
    patientId: String,
    mobileNumber: Number,
    fullName: String,
    gender: String,
    email: String,
    user: Number,
    updatedAt: Number,
    createdAt: Number,
    lastVisit: Number,
    hospitalId: String,
    doctorId: mongoose.Schema.ObjectId,
    creatorId: mongoose.Schema.ObjectId,
});

const HospitalsPatient = mongoose.model('HospitalsPatient', patientSchema);

export default HospitalsPatient;


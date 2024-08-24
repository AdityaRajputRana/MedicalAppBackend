import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'HospitalsPatient',required: [true,"Please Enter Patient Id"]},
    appt_date: { type: Date,required: [true, "Please Enter Appointment Date"],},
    appt_time: { type: Number,required: [true, "Please Enter Category Name"],},
    creator_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Staff',required: [true, "Please Enter Creator Id"]},
    createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
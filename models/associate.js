import mongoose, { Mongoose, mongo } from "mongoose";

const associateSchema = new mongoose.Schema({
    name: String,
    hospitalId: String,
    doctorId: String,
    type: String,
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pin: Number,
    },
    gpin: String,
    preference: Number
});

const Associate = mongoose.model('Associate', associateSchema);
export default Associate;
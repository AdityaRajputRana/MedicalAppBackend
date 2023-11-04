import mongoose, { mongo } from "mongoose";

const hospitalSchema = new mongoose.Schema({
    title: String,
    address: String,
    departments: [
        String
    ]
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;

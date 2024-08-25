import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    title: String,
    address: String,
    pageBackground: String,
    pageHeight: Number,
    pageWidth: Number,
    logo: String,
    departments: [
        String
    ]
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;

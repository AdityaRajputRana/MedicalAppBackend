import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
    name: String,
    hospitalId: String,
    doctorId: String,
    description: String,
    position: {
        type: Number,
        default: 100
    },
    url: String,
    type: String,
    mime: String,
});

const CareGuide = mongoose.model('CareGuide', guideSchema);
export default CareGuide;
import mongoose from "mongoose";

const PageConfigMetaSchema = new mongoose.Schema({
    hospitalId : String,
    doctorId: String,
    configUrl: String,
}, {
    timestamps:true
});


PageConfigMetaSchema.index({ hospitalId: 1, doctorId: 1}, { unique: true });

const PageConfigMeta = mongoose.model("PageConfigMetadata", PageConfigMetaSchema);
export default PageConfigMeta;
import mongoose from "mongoose";

const PageConfigMetaSchema = new mongoose.Schema({
    hospitalId : String,
    doctorId: String,
    configUrl: String,
}, {
    timestamps:true
});

PageConfigMetaSchema.pre('update', function( next ) {
    this.update({}, { $inc: { __v: 1 } }, next );
});

const PageConfigMeta = mongoose.model("PageConfigMetadata", PageConfigMetaSchema);
export default PageConfigMeta;
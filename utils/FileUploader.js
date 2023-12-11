import cd from 'cloudinary';
import PDFDocument from 'pdfkit';



export async function uploadToPermanentStorage(file, path, metadata) {
    const cloudinary = cd.v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await cloudinary.uploader.upload(file, {
            folder: path
    });

    return {
        publicUrl: result.url,
        folder: path,
        publicId: result.public_id,
        storage: "CD",
        path: result.path
    };

}
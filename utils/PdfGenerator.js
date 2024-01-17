import PDFDocument from 'pdfkit';
import cloudinary from 'cloudinary';
import { defaultScaleFactor } from '../config.js';



async function makePdf(pages, width, height, outputStream, background) {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({ height: height, width: width });
        const chunks = [];
        let pdfBuffer;

        doc.on('data', (chunk) => {
            chunks.push(chunk);
        });

        doc.on('end', async () => {
            pdfBuffer = Buffer.concat(chunks);
            try {
                const cloudinaryResult = await uploadPDFToCloudinary(pdfBuffer, 'cases/'+pages[0].caseId);
                resolve(cloudinaryResult);
            } catch (error) {
                reject(error);
            }
        });
        
        


        for (let a = 0; a < pages.length; a++) {
            if (a != 0) {
                doc.addPage();
            }

            const points = pages[a].points;
            for (let p = 0; p <= points.length; p++) {
                const point = points[p];
                if (!point) {
                    continue;
                }
                point.x *= defaultScaleFactor;
                point.y *= defaultScaleFactor;

                if (p == 0 || point.actionType == 1) {
                    doc.moveTo(point.x, point.y);
                } else if (point.actionType == 3) {
                    const prevPoint = points[p - 1];
                    let x = prevPoint.x + point.x;
                    let y = prevPoint.y + point.y;
                    x /= 2;
                    y /= 2;
                    doc.quadraticCurveTo(prevPoint.x, prevPoint.y, x, y);
                } else if (point.actionType == 2) {
                    doc.lineTo(point.x, point.y);
                } else {
                    doc.moveTo(point.x, point.y);
                    doc.circle(point.x, point.y, 1);
                }
            }

            doc.stroke();
        }

        doc.end();
    });
}

async function uploadPDFToCloudinary(pdfBuffer, folderName) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      {
            resource_type: 'raw',
            folder: folderName,
            format: 'pdf',
            public_id: "patientCopy"
      },
      async (error, result) => {
        if (error) {
          reject(error);
        } else {
            resolve(result.url); 
            resolve(result);
        }
      }
    ).end(pdfBuffer);
  });
}

export { makePdf };
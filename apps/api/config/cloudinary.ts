import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'walmart-sparkathon',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});

export const upload = multer({ storage });

export const uploadImageByUrl = async (url: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'walmart-sparkathon',
      resource_type: 'image',
    });
    console.log('Uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error(' Cloudinary upload failed for URL:', url, JSON.stringify(error, null, 2));
    return 'https://via.placeholder.com/500x500?text=Image+Unavailable';
  }
};
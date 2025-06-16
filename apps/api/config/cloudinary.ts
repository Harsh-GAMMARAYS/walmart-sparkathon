import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'walmart-sparkathon',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});

// Configure multer
export const upload = multer({ storage: storage });

// upload base64 image
export const uploadBase64Image = async (base64Data: string): Promise<string> => {
  try {
    if (base64Data.startsWith('data:image')) {
      console.log('Uploading complete data URL to Cloudinary');
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: 'walmart-sparkathon',
        resource_type: 'image',
      });
      console.log('Cloudinary upload result:', result.secure_url);
      return result.secure_url;
    }

    console.log('Uploading base64 string to Cloudinary');
    const dataUrl = `data:image/jpeg;base64,${base64Data}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'walmart-sparkathon',
      resource_type: 'image',
    });
    console.log('Cloudinary upload result:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return 'https://via.placeholder.com/500x500?text=Product+Image';
  }
}; 
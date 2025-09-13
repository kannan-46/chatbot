import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }


  async uploadBase64Image(base64Data: string, userId: string): Promise<string> {
    try {
      // Add data URL prefix if not present
      const dataUrl = base64Data.startsWith('data:') 
        ? base64Data 
        : `data:image/png;base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: `chatbot-avatars/${userId}`,
        public_id: `avatar-${Date.now()}`,
        resource_type: 'image',
        format: 'png',
        // Optional: Add transformations for optimization
        transformation: [
          { width: 512, height: 512, crop: 'limit' },
          { quality: 'auto', format: 'auto' }
        ]
      });

      console.log(`Image uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }


  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }
}

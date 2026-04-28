import { cloudinary } from "@/config/cloudinary";

export const uploadImage = async (file: Buffer, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'jornada-pim', public_id: filename },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );
    uploadStream.end(file);
  });
};
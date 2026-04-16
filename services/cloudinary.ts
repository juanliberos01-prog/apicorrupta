import { CLOUDINARY_CONFIG } from '../constants/config';

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImageToCloudinary(
  imageUri: string
): Promise<UploadResult> {
  const formData = new FormData();

  // Extraer nombre y tipo del archivo
  const filename = imageUri.split('/').pop() || 'product.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'ecommerce/products');

  const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al subir imagen a Cloudinary');
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}
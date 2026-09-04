export async function compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) {
  return new Promise((resolve) => {
    // If not an image or running non-browser, resolve original
    if (!file || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target.result);
      };
    };
  });
}

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'vanguard_unsigned')
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo')
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await response.json()
    if (data.secure_url) return data.secure_url;
    throw new Error('Cloudinary upload returned no secure URL');
  } catch (error) {
    console.warn('Cloudinary upload failed/skipped, using compressed local base64:', error)
    // Fallback: convert to compressed base64 data URL for local display & storage
    return compressImage(file, 800, 800, 0.6)
  }
}

export async function fileToBase64(file) {
  const compressedDataUrl = await compressImage(file, 800, 800, 0.6);
  const parts = compressedDataUrl.split(',');
  return parts.length > 1 ? parts[1] : parts[0];
}

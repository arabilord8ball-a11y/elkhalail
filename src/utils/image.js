/**
 * Compress an image file and convert it to a Base64 data URL.
 * Resizes the image to fit within maxWidth/maxHeight and applies JPEG compression.
 * This is useful for saving images in Supabase text columns or LocalStorage without massive payloads.
 * 
 * @param {File} file The file to compress
 * @param {number} maxWidth Maximum width of output image
 * @param {number} maxHeight Maximum height of output image
 * @param {number} quality JPEG compression quality (0.0 to 1.0)
 * @returns {Promise<string>} Base64 data URL
 */
export function compressImageToBase64(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed base64 jpeg
        try {
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } catch (e) {
          // Fallback if canvas conversion fails
          resolve(event.target.result);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

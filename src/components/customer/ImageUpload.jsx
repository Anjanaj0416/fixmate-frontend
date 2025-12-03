import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

/**
 * ImageUpload Component
 * Handles multiple image uploads with preview and base64 conversion
 * 
 * @param {Array} images - Current images array
 * @param {Function} onChange - Callback when images change
 * @param {Number} maxImages - Maximum number of images allowed (default: 5)
 * @param {Number} maxSizeMB - Maximum file size in MB (default: 5)
 */
const ImageUpload = ({ images = [], onChange, maxImages = 5, maxSizeMB = 5 }) => {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  /**
   * Convert file to base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    setError('');

    // Check if adding these files exceeds max
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const newImages = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          setError(`${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);

        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64
        });
      }

      // Call onChange with updated images array
      onChange([...images, ...newImages]);

    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  /**
   * Remove image from array
   */
  const handleRemove = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onChange(updatedImages);
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {uploading ? 'Uploading...' : 'Upload Problem Photos'}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || images.length >= maxImages}
                className="sr-only"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {images.length} / {maxImages} images • Max {maxSizeMB}MB each
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supported: JPG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* Image */}
              <div className="aspect-square">
                <img
                  src={image.base64}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium mb-1 px-2 text-center truncate w-full">
                    {image.name}
                  </p>
                  <p className="text-white text-xs">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {images.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Photos help workers understand the problem better and provide accurate quotes
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
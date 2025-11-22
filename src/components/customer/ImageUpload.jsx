import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../common';

/**
 * Image Upload Component
 * Upload and manage problem images
 */
const ImageUpload = ({ onImagesChange, maxImages = 5, maxSize = 10485760 }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const validFiles = [];
      
      for (const file of files) {
        // Validate file size
        if (file.size > maxSize) {
          setError(`File "${file.name}" is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`File "${file.name}" is not an image`);
          continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        validFiles.push({
          file,
          previewUrl,
          name: file.name,
          size: file.size,
        });
      }

      if (validFiles.length > 0) {
        const newImages = [...images, ...validFiles];
        setImages(newImages);
        
        // Call parent callback
        if (onImagesChange) {
          onImagesChange(newImages.map(img => img.file));
        }
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Error processing files');
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Call parent callback
    if (onImagesChange) {
      onImagesChange(newImages.map(img => img.file));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Problem Images {images.length > 0 && `(${images.length}/${maxImages})`}
        </label>
        
        {images.length < maxImages && (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-10 w-10 text-indigo-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">Processing...</p>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to {maxSize / 1024 / 1024}MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || images.length >= maxImages}
            />
          </label>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500">
          Tips: Take clear, well-lit photos showing the problem from different angles
        </p>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 rounded-lg overflow-hidden"
              >
                {/* Image */}
                <img
                  src={image.previewUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Why upload images?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Helps workers understand the problem better</li>
                <li>Get more accurate quotes</li>
                <li>AI can identify the issue and match you with the right worker</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  onImagesChange: PropTypes.func,
  maxImages: PropTypes.number,
  maxSize: PropTypes.number,
};

export default ImageUpload;
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Image Upload Component - FIXED
 * Handles image selection, preview, compression, and Base64 conversion
 * 
 * ✅ FIXED: Proper prop handling
 * ✅ FIXED: Image compression
 * ✅ FIXED: Base64 conversion for MongoDB
 */
const ImageUpload = ({ 
  images = [], 
  setImages, 
  maxImages = 5,
  maxSizeMB = 5,
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    await processFiles(files);
  };

  /**
   * Process and compress images
   */
  const processFiles = async (files) => {
    if (files.length === 0) return;

    if (files.length + images.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const imagePromises = files.map((file) => compressImage(file));
      const newImages = await Promise.all(imagePromises);
      
      // Filter out any failed compressions
      const validImages = newImages.filter(img => img !== null);
      
      setImages([...images, ...validImages]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setError('Failed to process some images');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Compress and convert image to Base64
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a supported image format`);
        resolve(null);
        return;
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
        resolve(null);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 1920x1080)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          // Draw compressed image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to Base64 (JPEG with 85% quality for good balance)
          const base64 = canvas.toDataURL('image/jpeg', 0.85);

          // Calculate compressed size
          const compressedSize = Math.round((base64.length * 3) / 4);

          resolve({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            base64: base64,
            size: compressedSize,
            originalSize: file.size,
            compressedSize: compressedSize
          });
        };

        img.onerror = () => {
          setError(`Failed to load ${file.name}`);
          resolve(null);
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        setError(`Failed to read ${file.name}`);
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove image from list
   */
  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
    setError('');
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={loading || images.length >= maxImages}
          className="hidden"
          id="image-upload-input"
        />
        
        <label
          htmlFor="image-upload-input"
          className={`flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-all ${
            loading || images.length >= maxImages
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
              <span className="text-indigo-600 font-medium mt-4">Processing images...</span>
            </>
          ) : (
            <>
              <Upload size={40} className={dragActive ? 'text-indigo-600' : 'text-indigo-500'} />
              <div className="text-center mt-4">
                <p className="text-indigo-600 font-medium text-lg">
                  Upload Problem Photos
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {images.length} / {maxImages} images • Max {maxSizeMB}MB each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: JPG, PNG, WebP
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all"
            >
              {/* Image */}
              <img
                src={image.base64}
                alt={image.filename}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                type="button"
                title="Remove image"
              >
                <X size={18} />
              </button>

              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium truncate">{image.filename}</p>
                <p className="text-xs opacity-75">
                  {formatFileSize(image.compressedSize)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs mt-1">Add up to {maxImages} photos of the problem</p>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Photos will be compressed automatically for faster upload</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• Clear photos help workers understand the problem better</p>
      </div>
    </div>
  );
};

export default ImageUpload;
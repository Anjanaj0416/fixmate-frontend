import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Image Upload Component
 * Handles image selection, preview, compression, and Base64 conversion
 * 
 * WHY: Need to upload problem photos to MongoDB as Base64 strings
 * FEATURES:
 * - Image selection with preview
 * - Automatic compression and resizing
 * - Base64 conversion for MongoDB storage
 * - Max file size and count validation
 * - Drag and drop support
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

      console.log(`✅ Uploaded ${validImages.length} images`);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.message || 'Failed to upload images');
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
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        resolve(null);
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`${file.name} exceeds ${maxSizeMB}MB limit`);
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Resize if too large
            const maxDimension = 1200;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension;
                width = maxDimension;
              } else {
                width = (width / height) * maxDimension;
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Base64 with compression
            // JPEG format with 80% quality for good balance
            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            // Calculate compressed size
            const base64Size = (base64.length * 3) / 4 / (1024 * 1024);
            
            console.log(`📸 Compressed ${file.name}:`, {
              original: `${fileSizeMB.toFixed(2)}MB`,
              compressed: `${base64Size.toFixed(2)}MB`,
              dimensions: `${width}x${height}`,
            });

            resolve({
              id: Date.now() + Math.random(),
              base64,
              filename: file.name,
              size: file.size,
              compressedSize: base64.length,
              type: 'image/jpeg', // Always JPEG after compression
              originalType: file.type,
              uploadedAt: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error processing image:', error);
            setError(`Failed to process ${file.name}`);
            resolve(null);
          }
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
   * Remove image
   */
  const removeImage = (imageId) => {
    setImages(images.filter((img) => img.id !== imageId));
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

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className="relative"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload-input"
          disabled={loading || images.length >= maxImages}
        />
        
        <button
          type="button"
          onClick={handleClick}
          disabled={loading || images.length >= maxImages}
          className={`w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-lg transition-all ${
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
              <span className="text-indigo-600 font-medium">Processing images...</span>
            </>
          ) : (
            <>
              <Upload size={40} className={dragActive ? 'text-indigo-600' : 'text-indigo-500'} />
              <div className="text-center">
                <p className="text-indigo-600 font-medium text-lg">
                  Upload Problem Photos
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {images.length} / {maxImages} images • Max {maxSizeMB}MB each
                </p>
              </div>
            </>
          )}
        </button>
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
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
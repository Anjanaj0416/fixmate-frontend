import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Image Upload Component - IMPROVED COMPRESSION
 * Handles image selection, preview, aggressive compression, and Base64 conversion
 * 
 * ✅ CRITICAL FIXES:
 * 1. More aggressive compression (quality: 0.6 instead of 0.7)
 * 2. Smaller max dimensions (800px instead of 1200px)
 * 3. Better error messages
 * 4. Size validation before compression
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
   * Handle drag and drop
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  /**
   * Process and compress images
   */
  const processFiles = async (files) => {
    if (files.length === 0) return;

    // Check total count
    if (files.length + images.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const imagePromises = files.map((file) => compressImage(file));
      const newImages = await Promise.all(imagePromises);
      
      // Filter out any failed compressions
      const validImages = newImages.filter(img => img !== null);
      
      if (validImages.length > 0) {
        setImages([...images, ...validImages]);
        console.log(`✅ Successfully compressed ${validImages.length} images`);
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process some images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ IMPROVED: Compress and convert image to Base64 with aggressive compression
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a supported image format (JPG, PNG, WEBP only)`);
        resolve(null);
        return;
      }

      // Validate file size (before compression)
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum ${maxSizeMB}MB per image.`);
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

            // ✅ CRITICAL FIX: Reduce max dimensions from 1200px to 800px
            // This significantly reduces file size while maintaining quality
            const maxDimension = 800;
            
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
            
            // ✅ Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, width, height);

            // ✅ CRITICAL FIX: More aggressive compression (0.6 instead of 0.7)
            // Quality: 0.6 = Good balance between size and quality
            // For quote requests, 60% quality is sufficient
            const base64 = canvas.toDataURL('image/jpeg', 0.6);

            // ✅ Calculate compressed size
            const compressedSizeKB = Math.round((base64.length * 0.75) / 1024);
            console.log(`📷 ${file.name}: ${Math.round(file.size / 1024)}KB → ${compressedSizeKB}KB (${Math.round((compressedSizeKB / (file.size / 1024)) * 100)}%)`);

            // ✅ Check if compressed image is still too large (shouldn't happen with these settings)
            const maxCompressedSizeKB = 2048; // 2MB per image after compression
            if (compressedSizeKB > maxCompressedSizeKB) {
              setError(`${file.name} is still too large after compression. Please choose a smaller image.`);
              resolve(null);
              return;
            }

            resolve({
              base64,
              preview: base64,
              name: file.name,
              size: compressedSizeKB,
              originalSize: Math.round(file.size / 1024)
            });

          } catch (error) {
            console.error(`Error compressing ${file.name}:`, error);
            setError(`Failed to compress ${file.name}`);
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
   * Remove image from list
   */
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setError('');
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading || images.length >= maxImages}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {loading ? (
              'Compressing images...'
            ) : (
              <>
                <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WEBP up to {maxSizeMB}MB each (Max {maxImages} images)
          </p>
          <p className="text-xs text-gray-500">
            {images.length} / {maxImages} images uploaded
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image.preview || image.base64}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Size Info */}
              <div className="mt-1 text-xs text-gray-500 text-center">
                {image.size ? `${image.size}KB` : 'Compressed'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {images.length === 0 && !error && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-600">
            <p className="font-medium">Tips for better compression:</p>
            <ul className="mt-1 list-disc list-inside text-xs">
              <li>Images will be automatically resized to 800px max</li>
              <li>Quality is optimized for web viewing</li>
              <li>Average compressed size: 200-500KB per image</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
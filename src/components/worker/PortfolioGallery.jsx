import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Upload, X, Image as ImageIcon, Plus, Trash2, ZoomIn } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { workerService } from '../../services/workerService';

const PortfolioGallery = ({ workerId = null, viewOnly = false }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [captions, setCaptions] = useState({});

  useEffect(() => {
    fetchPortfolio();
  }, [workerId]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await workerService.getPortfolio(workerId);
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      setUploadFiles(validFiles);
      const initialCaptions = {};
      validFiles.forEach((_, index) => {
        initialCaptions[index] = '';
      });
      setCaptions(initialCaptions);
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      
      uploadFiles.forEach((file, index) => {
        formData.append('images', file);
        formData.append(`caption_${index}`, captions[index] || '');
      });

      await workerService.uploadPortfolio(formData);
      
      // Refresh portfolio
      await fetchPortfolio();
      
      // Reset state
      setUploadFiles([]);
      setCaptions({});
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading portfolio:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await workerService.deletePortfolioImage(imageId);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleCaptionChange = (index, value) => {
    setCaptions(prev => ({
      ...prev,
      [index]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" text="Loading portfolio..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Button (for workers only) */}
      {!viewOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            My Portfolio ({portfolio.length} images)
          </h3>
          <label htmlFor="portfolio-upload">
            <Button
              variant="primary"
              icon={<Plus size={20} />}
              onClick={() => document.getElementById('portfolio-upload').click()}
            >
              Add Images
            </Button>
            <input
              id="portfolio-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolio.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {viewOnly ? 'No Portfolio Images' : 'No Images Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {viewOnly 
              ? 'This worker hasn\'t uploaded any portfolio images yet.'
              : 'Showcase your best work by adding images to your portfolio.'
            }
          </p>
          {!viewOnly && (
            <label htmlFor="portfolio-upload-empty">
              <Button
                variant="outline"
                icon={<Upload size={20} />}
                onClick={() => document.getElementById('portfolio-upload-empty').click()}
              >
                Upload Your First Images
              </Button>
              <input
                id="portfolio-upload-empty"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolio.map((item) => (
            <div
              key={item._id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              {/* Image */}
              <img
                src={item.imageUrl}
                alt={item.caption || 'Portfolio image'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                {/* View button */}
                <button
                  onClick={() => setSelectedImage(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full hover:bg-gray-100"
                  aria-label="View image"
                >
                  <ZoomIn size={20} className="text-gray-700" />
                </button>

                {/* Delete button (workers only) */}
                {!viewOnly && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-500 rounded-full hover:bg-red-600"
                    aria-label="Delete image"
                  >
                    <Trash2 size={20} className="text-white" />
                  </button>
                )}
              </div>

              {/* Caption overlay (bottom) */}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          size="xl"
          title={selectedImage.caption || 'Portfolio Image'}
        >
          <div className="space-y-4">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.caption || 'Portfolio image'}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            {selectedImage.caption && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedImage.caption}</p>
              </div>
            )}
            {selectedImage.uploadedAt && (
              <p className="text-sm text-gray-500">
                Uploaded on {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadFiles([]);
            setCaptions({});
          }}
          title="Upload Portfolio Images"
          size="lg"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                  setCaptions({});
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={uploading}
                onClick={handleUpload}
                disabled={uploadFiles.length === 0}
              >
                Upload {uploadFiles.length} {uploadFiles.length === 1 ? 'Image' : 'Images'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add captions to your images to help customers understand your work better.
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {uploadFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />

                    {/* Caption Input */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption (optional)
                      </label>
                      <textarea
                        value={captions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        placeholder="Describe this work..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(captions[index] || '').length}/200 characters
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => {
                        const newFiles = uploadFiles.filter((_, i) => i !== index);
                        setUploadFiles(newFiles);
                        const newCaptions = { ...captions };
                        delete newCaptions[index];
                        setCaptions(newCaptions);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

PortfolioGallery.propTypes = {
  workerId: PropTypes.string, // If provided, fetches another worker's portfolio (view only)
  viewOnly: PropTypes.bool, // If true, hides upload/delete actions
};

export default PortfolioGallery;
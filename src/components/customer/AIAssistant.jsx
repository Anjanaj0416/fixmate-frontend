import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Modal, Spinner } from '../common';
import WorkerCard from './WorkerCard';

/**
 * AI Assistant Component
 * AI-powered worker matching based on problem description and images
 */
const AIAssistant = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: describe, 2: upload, 3: results
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  // Go to next step
  const handleNext = () => {
    if (step === 1 && description.length < 20) {
      alert('Please provide a detailed description (minimum 20 characters)');
      return;
    }
    setStep(step + 1);
  };

  // Go back
  const handleBack = () => {
    setStep(step - 1);
  };

  // Get AI recommendations
  const getRecommendations = async () => {
    setLoading(true);
    setStep(3);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('description', description);
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      // Get user location
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user?.location?.coordinates) {
        formData.append('latitude', user.location.coordinates.latitude);
        formData.append('longitude', user.location.coordinates.longitude);
      }

      // Call AI API
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/ai/match-workers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get recommendations');
      }

      setRecommendations(data.recommendations);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Handle book worker
  const handleBookWorker = (workerId) => {
    onClose();
    navigate(`/booking?workerId=${workerId}`);
  };

  // Reset and close
  const handleClose = () => {
    setStep(1);
    setDescription('');
    setImages([]);
    setRecommendations([]);
    setAnalysis(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Worker Matching Assistant"
      size="xl"
      closeOnOverlayClick={false}
    >
      <div className="min-h-[400px]">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Describe
            </span>
            <span className={step >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Upload Photos
            </span>
            <span className={step >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}>
              Get Matches
            </span>
          </div>
        </div>

        {/* Step 1: Describe Problem */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Describe Your Problem
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tell us what needs to be fixed. Our AI will analyze your description to find the best workers.
              </p>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Example: My kitchen sink is leaking from the pipe underneath. Water drips constantly..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

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
                  <p className="font-semibold mb-1">Tips for better matching:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Be specific about the problem</li>
                    <li>Mention any relevant details (location, urgency, etc.)</li>
                    <li>Describe any damage or visible issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={description.length < 20}
              >
                Next: Upload Photos
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Images */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Photos (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add photos to help our AI better understand the problem and find the right workers.
              </p>

              {/* Upload Button */}
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
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
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 10MB (max 3 images)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 3}
                />
              </label>

              {/* Uploaded Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between space-x-4 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={getRecommendations}
              >
                Find Workers
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">
                  Our AI is analyzing your problem...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : recommendations.length > 0 ? (
              <>
                {/* AI Analysis */}
                {analysis && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">
                      AI Analysis
                    </h4>
                    <p className="text-sm text-indigo-800 mb-3">
                      {analysis.summary}
                    </p>
                    <div className="flex items-center text-sm text-indigo-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Confidence: {Math.round(analysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommended Workers */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recommended Workers
                  </h3>
                  <div className="space-y-4">
                    {recommendations.map((worker, index) => (
                      <div key={worker.id} className="relative">
                        {index === 0 && (
                          <div className="absolute -top-2 -left-2 z-10">
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                              Best Match
                            </span>
                          </div>
                        )}
                        <WorkerCard
                          worker={worker}
                          variant="compact"
                          onContact={() => handleBookWorker(worker.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    Search Again
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any workers matching your requirements.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Try Again
                  </Button>
                  <Button variant="primary" onClick={handleClose}>
                    Browse All Workers
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

AIAssistant.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AIAssistant;
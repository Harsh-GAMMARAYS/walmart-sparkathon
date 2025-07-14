'use client';

import { useState, useEffect } from 'react';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productTitle: string;
}

export function VirtualTryOnModal({ isOpen, onClose, productImage, productTitle }: VirtualTryOnModalProps) {
  const [step, setStep] = useState(0); // 0: product, 1: user, 2: processing, 3: result
  const [isAnimating, setIsAnimating] = useState(false);
  const [userPhotoLoaded, setUserPhotoLoaded] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setStep(0); // Reset to first step when modal opens
      setUserPhotoLoaded(false); // Reset user photo state
      setIsLoadingPhoto(false); // Reset loading state
      setProgressPercent(0); // Reset progress bar
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (step < 3) {
      if (step === 1) {
        // Before processing step, show a longer delay
        setStep(2);
        setProgressPercent(0); // Reset progress
        
        // Animate progress bar over 7 seconds
        const duration = 7000;
        const interval = 50; // Update every 50ms
        const increment = 100 / (duration / interval);
        
        const progressInterval = setInterval(() => {
          setProgressPercent(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + increment;
          });
        }, interval);
        
        setTimeout(() => {
          clearInterval(progressInterval);
          setProgressPercent(100);
          setStep(3);
        }, duration);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setStep(0);
    }, 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBrowsePhoto = () => {
    setIsLoadingPhoto(true);
    // Simulate file browsing and loading delay
    setTimeout(() => {
      setUserPhotoLoaded(true);
      setIsLoadingPhoto(false);
    }, 2000);
  };

  const getStepContent = () => {
    switch (step) {
      case 0:
        return {
          title: "Step 1: Product Selection",
          subtitle: "Selected product for virtual try-on",
          image: productImage,
          buttonText: "Next: Upload Your Photo",
          showButton: true
        };
      case 1:
        return {
          title: "Step 2: Your Photo",
          subtitle: userPhotoLoaded ? "Great! This is your photo for virtual try-on" : "Upload your photo to see how the product looks on you",
          image: userPhotoLoaded ? "/virtual-tryon/user-photo.jpg" : "",
          buttonText: userPhotoLoaded ? "Start Virtual Try-On" : "",
          showButton: userPhotoLoaded
        };
      case 2:
        return {
          title: "Processing...",
          subtitle: "AI is creating your virtual try-on experience",
          image: "", // No image needed for processing
          buttonText: "",
          showButton: false
        };
      case 3:
        return {
          title: "Virtual Try-On Result",
          subtitle: "Here's how the product looks on you!",
          image: "/virtual-tryon/result-photo.png", // Final result
          buttonText: "Try Another Product",
          showButton: true
        };
      default:
        return {
          title: "",
          subtitle: "",
          image: "",
          buttonText: "",
          showButton: false
        };
    }
  };

  if (!isOpen) return null;

  const stepContent = getStepContent();

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isAnimating ? 'backdrop-blur-[8px] bg-transparent' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-[90vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white rounded-t-2xl border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-gray-900">Virtual Try-On</h2>
              <p className="text-xs text-gray-600 mt-1 truncate">{productTitle}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close Virtual Try-On"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((num, index) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {num}
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-1 w-12 mx-1 ${
                        index < step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <span>Product</span>
              <span>Your Photo</span>
              <span>Processing</span>
              <span>Result</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-full pt-32 pb-6 px-4 overflow-auto">
          <div className="h-full flex flex-col items-center justify-start min-h-0 pt-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{stepContent.title}</h3>
            <p className="text-gray-600 mb-6 text-center text-sm">{stepContent.subtitle}</p>
            
            {/* Image Display */}
            <div className="flex-1 w-full max-w-2xl flex items-center justify-center mb-6">
              {step === 1 && !userPhotoLoaded ? (
                // File browse interface
                <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-12 w-full">
                  <div className="mb-4">
                    <svg className="mx-auto h-28 w-28 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isLoadingPhoto ? "Loading your photo..." : "Upload your photo"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {isLoadingPhoto ? "Please wait while we process your image" : "Choose a clear photo where you can be seen from head to toe"}
                  </p>
                  {isLoadingPhoto ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-600">Processing...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleBrowsePhoto}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Browse Files
                    </button>
                  )}
                  {!isLoadingPhoto && (
                    <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, GIF</p>
                  )}
                </div>
              ) : step === 2 ? (
                // Enhanced Processing animation
                <div className="text-center w-full max-w-md">
                  {/* Main Spinner */}
                  <div className="relative mx-auto mb-6">
                    <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-24 w-24 border-4 border-blue-400 opacity-20 mx-auto"></div>
                    <div className="absolute inset-2 animate-spin rounded-full h-20 w-20 border-2 border-purple-400 border-b-transparent mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 animate-pulse">Analyzing body measurements...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2" style={{animationDelay: '0.5s'}}>
                      <div className="animate-pulse h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 animate-pulse">Matching product dimensions...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2" style={{animationDelay: '1s'}}>
                      <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 animate-pulse">Generating virtual fitting...</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100 ease-out" 
                      style={{width: `${progressPercent}%`}}
                    ></div>
                  </div>
                  
                  {/* Fun Facts */}
                  <div className="text-xs text-gray-500 italic">
                    <p className="animate-pulse">✨ Processing over 1000 data points...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border">
                  <img
                    src={stepContent.image}
                    alt={stepContent.title}
                    className="max-w-[520px] max-h-[520px] object-contain rounded-xl shadow-2xl m-4"
                    onError={(e) => {
                      console.error('Image failed to load:', stepContent.image);
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            {stepContent.showButton && (
              <button
                onClick={step === 3 ? handleClose : handleNext}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {stepContent.buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
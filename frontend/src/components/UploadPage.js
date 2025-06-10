import React, { useState, useRef } from 'react';
import { Camera, Upload, Image, ArrowLeft, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from './Notification';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const [uploaderName, setUploaderName] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 1000; // 1KB

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (file.size < minSize) {
      return 'File seems too small to be a valid photo';
    }

    return null;
  };

  const uploadFile = async (file) => {
    if (!isOnline) {
      setNotification({
        type: 'error',
        message: 'No internet connection. Please check your connection and try again.'
      });
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setNotification({
        type: 'error',
        message: validationError
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (uploaderName.trim()) {
        formData.append('uploader_info', uploaderName.trim());
      }

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${API}/photos/upload`);
        xhr.send(formData);
      });

    } catch (error) {
      throw error;
    }
  };

  const handleFile = async (file) => {
    console.log('Processing file:', file.name, file.type, file.size);

    try {
      const response = await uploadFile(file);
      
      setNotification({
        type: 'success',
        message: 'Photo uploaded successfully! It will appear on the wall shortly.'
      });

      // Reset form
      setUploaderName('');
      
      // Redirect to wall after short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to upload photo. Please try again.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Wall
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Upload Photos</h1>
                <p className="text-white/60">Share your moments with everyone</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white/60">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Uploader Name Input */}
          <div className="mb-8">
            <label className="block text-white/80 text-sm font-medium mb-3">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="Enter your name to be credited with the photo"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm"
              disabled={isUploading}
            />
          </div>

          {/* Upload Area */}
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''} ${!isOnline ? 'opacity-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="space-y-6">
                <Upload className="w-16 h-16 text-blue-400 mx-auto animate-bounce" />
                <div>
                  <p className="text-white text-xl font-semibold mb-2">Uploading your photo...</p>
                  <p className="text-white/60 text-sm mb-4">Please don't close this page</p>
                  
                  <div className="progress-bar mb-2">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-white/80 text-sm">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <>
                <Image className="w-20 h-20 text-white/60 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-3">
                  Share Your Photo
                </h2>
                <p className="text-white/80 mb-8 text-lg">
                  {isOnline 
                    ? 'Drag and drop your photo here, or use the buttons below'
                    : 'You are offline. Please connect to the internet to upload photos.'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isOnline}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Upload className="w-6 h-6" />
                    Choose File
                  </button>
                  
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={!isOnline}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Camera className="w-6 h-6" />
                    Take Photo
                  </button>
                </div>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-white/60">
            <div className="flex items-center justify-center gap-6 mb-4 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Max size: 10MB
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                JPG, PNG, GIF, WebP
              </span>
            </div>
            <p className="text-sm">
              Your photo will be visible to everyone on the event wall immediately after upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
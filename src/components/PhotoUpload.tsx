
import React, { useState, useRef } from 'react';
import { Camera, Upload, Image } from 'lucide-react';
import { Photo } from '../types/Photo';

interface PhotoUploadProps {
  onPhotoAdd: (photo: Photo) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoAdd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    console.log('Processing file:', file.name, file.type, file.size);
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File loaded successfully');
        const photo: Photo = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: e.target?.result as string,
          timestamp: Date.now(),
          filename: file.name,
          size: file.size
        };
        
        console.log('Adding photo:', photo.id);
        onPhotoAdd(photo);
        setIsUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert('Error reading file. Please try again.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files.length);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Files selected:', files?.length);
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const triggerCameraCapture = () => {
    console.log('Camera capture triggered');
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const triggerFileSelect = () => {
    console.log('File select triggered');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-400/10 scale-105'
            : 'border-white/30 bg-white/5 hover:bg-white/10'
        } backdrop-blur-sm`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="animate-pulse">
            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
            <p className="text-white text-lg">Processing your photo...</p>
          </div>
        ) : (
          <>
            <Image className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Share Your Photo
            </h3>
            <p className="text-white/80 mb-6">
              Drag and drop your photo here, or use the buttons below
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={triggerFileSelect}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 min-h-[48px]"
                type="button"
              >
                <Upload className="w-5 h-5" />
                Choose File
              </button>
              
              <button
                onClick={triggerCameraCapture}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 min-h-[48px]"
                type="button"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            </div>
          </>
        )}
        
        {/* File input for gallery/file selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          multiple={false}
        />
        
        {/* Camera input with better mobile support */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          multiple={false}
        />
      </div>
      
      <div className="text-center text-white/60 text-sm">
        <p>Maximum file size: 10MB • Supported formats: JPG, PNG, GIF, WebP</p>
      </div>
    </div>
  );
};

export default PhotoUpload;


import React, { useState, useEffect } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import { Photo } from '../types/Photo';

const Upload = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('eventPhotos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  const addPhoto = (newPhoto: Photo) => {
    const savedPhotos = localStorage.getItem('eventPhotos');
    const existingPhotos = savedPhotos ? JSON.parse(savedPhotos) : [];
    const updatedPhotos = [newPhoto, ...existingPhotos];
    
    // Auto-delete oldest photos if we exceed the limit
    const maxPhotos = 500;
    if (updatedPhotos.length > maxPhotos) {
      updatedPhotos.splice(maxPhotos);
    }
    
    localStorage.setItem('eventPhotos', JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
    
    // Show success message
    setTimeout(() => {
      alert('Photo uploaded successfully! It will appear on the display screen.');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Share Your Photo
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Upload a photo and watch it appear on the event display
          </p>
        </div>

        <PhotoUpload onPhotoAdd={addPhoto} />
        
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Photos uploaded: {photos.length} / 500
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;

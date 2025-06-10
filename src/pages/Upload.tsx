
import React from 'react';
import PhotoUpload from '../components/PhotoUpload';
import { usePhotos } from '@/hooks/usePhotos';

const Upload = () => {
  const { photos } = usePhotos();

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

        <PhotoUpload />
        
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

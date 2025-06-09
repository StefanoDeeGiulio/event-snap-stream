
import React, { useState, useEffect } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import PhotoWall from '../components/PhotoWall';
import AdminPanel from '../components/AdminPanel';
import { Photo } from '../types/Photo';

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maxPhotos] = useState(500);

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('eventPhotos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    localStorage.setItem('eventPhotos', JSON.stringify(photos));
  }, [photos]);

  const addPhoto = (newPhoto: Photo) => {
    setPhotos(prevPhotos => {
      const updatedPhotos = [newPhoto, ...prevPhotos];
      
      // Auto-delete oldest photos if we exceed the limit
      if (updatedPhotos.length > maxPhotos) {
        return updatedPhotos.slice(0, maxPhotos);
      }
      
      return updatedPhotos;
    });
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
  };

  const clearAllPhotos = () => {
    setPhotos([]);
    localStorage.removeItem('eventPhotos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Toggle */}
      <button
        onClick={() => setIsAdmin(!isAdmin)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
      >
        {isAdmin ? 'Exit Admin' : 'Admin Mode'}
      </button>

      {/* QR Code Info */}
      <div className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white">
        <div className="text-sm">
          Share this URL: <span className="font-mono">{window.location.href}</span>
        </div>
      </div>

      {/* Photo Count Display */}
      <div className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white">
        <div className="text-sm">
          Photos: {photos.length} / {maxPhotos}
        </div>
      </div>

      {isAdmin && (
        <AdminPanel
          photoCount={photos.length}
          maxPhotos={maxPhotos}
          onClearPhotos={clearAllPhotos}
          onDeletePhoto={deletePhoto}
          photos={photos}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Event Photo Wall
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Share your moments and watch them come to life on the big screen
          </p>
        </div>

        <PhotoUpload onPhotoAdd={addPhoto} />
        <PhotoWall photos={photos} />
      </div>
    </div>
  );
};

export default Index;

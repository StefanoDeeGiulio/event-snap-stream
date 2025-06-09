
import React, { useState, useEffect } from 'react';
import PhotoWall from '../components/PhotoWall';
import AdminPanel from '../components/AdminPanel';
import { Photo } from '../types/Photo';

const Wall = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [maxPhotos] = useState(500);

  // Load photos from localStorage and poll for updates
  useEffect(() => {
    const loadPhotos = () => {
      const savedPhotos = localStorage.getItem('eventPhotos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    };

    loadPhotos();
    
    // Poll for new photos every 2 seconds
    const interval = setInterval(loadPhotos, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    localStorage.setItem('eventPhotos', JSON.stringify(updatedPhotos));
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
            Live display of shared moments
          </p>
        </div>

        <PhotoWall photos={photos} />
      </div>
    </div>
  );
};

export default Wall;

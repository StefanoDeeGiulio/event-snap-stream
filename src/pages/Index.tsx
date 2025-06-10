
import React, { useState } from 'react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import PhotoWall from '../components/PhotoWall';
import AdminPanel from '../components/AdminPanel';
import { usePhotos } from '@/hooks/usePhotos';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [maxPhotos] = useState(500);
  const { photos, deletePhoto, clearAllPhotos } = usePhotos();
  const uploadUrl = `${window.location.origin}/upload`;

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

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Event Photo Sharing
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Share your moments in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* QR Code Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              Scan to Upload Photos
            </h2>
            <div className="flex justify-center">
              <QRCodeDisplay value={uploadUrl} size={300} />
            </div>
            <p className="text-white/60 text-sm mt-4">
              Upload URL: {uploadUrl}
            </p>
          </div>

          {/* Photo Wall Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center lg:text-left">
              Live Photo Wall
            </h2>
            <div className="max-h-[600px] overflow-y-auto">
              <PhotoWall photos={photos} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

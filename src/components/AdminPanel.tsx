
import React, { useState } from 'react';
import { Trash2, Download, Eye, X } from 'lucide-react';
import { Photo } from '../types/Photo';

interface AdminPanelProps {
  photoCount: number;
  maxPhotos: number;
  onClearPhotos: () => void;
  onDeletePhoto: (photoId: string) => void;
  photos: Photo[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  photoCount,
  maxPhotos,
  onClearPhotos,
  onDeletePhoto,
  photos
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleClearPhotos = () => {
    if (showConfirm) {
      onClearPhotos();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllPhotos = () => {
    const photoData = {
      photos: photos,
      exportDate: new Date().toISOString(),
      totalPhotos: photos.length
    };
    
    const blob = new Blob([JSON.stringify(photoData, null, 2)], {
      type: 'application/json'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `event-photos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed top-16 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
        
        <div className="space-y-4">
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Storage Usage:</span>
              <span>{((photoCount / maxPhotos) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(photoCount / maxPhotos) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={exportAllPhotos}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export All Photos
            </button>
            
            <button
              onClick={handleClearPhotos}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showConfirm
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {showConfirm ? 'Confirm Clear All' : 'Clear All Photos'}
            </button>
            
            {showConfirm && (
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="border-t border-white/20 pt-4">
            <h4 className="text-sm font-medium mb-2">Recent Photos</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {photos.slice(0, 10).map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-8 h-8 object-cover rounded cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{photo.filename}</p>
                    <p className="text-xs text-white/60">
                      {new Date(photo.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
              <p className="font-medium">{selectedPhoto.filename}</p>
              <p className="text-sm text-white/80">
                {new Date(selectedPhoto.timestamp).toLocaleString()}
              </p>
              <button
                onClick={() => downloadPhoto(selectedPhoto)}
                className="mt-2 flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;

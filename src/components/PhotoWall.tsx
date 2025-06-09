
import React, { useEffect, useState } from 'react';
import { Photo } from '../types/Photo';

interface PhotoWallProps {
  photos: Photo[];
}

const PhotoWall: React.FC<PhotoWallProps> = ({ photos }) => {
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    // Animate new photos appearing
    if (photos.length > displayedPhotos.length) {
      const newPhotos = photos.slice(0, photos.length - displayedPhotos.length);
      
      newPhotos.forEach((photo, index) => {
        setTimeout(() => {
          setDisplayedPhotos(prev => [photo, ...prev]);
        }, index * 200); // Stagger the animations
      });
    } else {
      setDisplayedPhotos(photos);
    }
  }, [photos]);

  if (displayedPhotos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-white/40 text-lg">
          No photos yet. Be the first to share a moment!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {displayedPhotos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </div>
  );
};

const PhotoCard: React.FC<{ photo: Photo; index: number }> = ({ photo, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative group transition-all duration-700 transform ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
        <div className="aspect-square">
          <img
            src={photo.url}
            alt={photo.filename}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse" />
          )}
        </div>
        
        {/* Overlay with photo info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs truncate">
              {new Date(photo.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {/* New photo indicator */}
        {index < 5 && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoWall;

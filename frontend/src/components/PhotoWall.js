import React, { useState, useEffect } from 'react';
import { Camera, QrCode, RefreshCw, Users, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCodeGenerator from './QRCodeGenerator';
import Notification from './Notification';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PhotoWall = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({ totalPhotos: 0, todayPhotos: 0 });

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API}/photos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPhotos(data);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayPhotos = data.filter(photo => 
        new Date(photo.uploaded_at).toDateString() === today
      ).length;
      
      setStats({
        totalPhotos: data.length,
        todayPhotos: todayPhotos
      });
      
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err.message);
      setNotification({
        type: 'error',
        message: 'Failed to load photos. Please check your connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    
    // Auto-refresh every 10 seconds to show new uploads
    const interval = setInterval(fetchPhotos, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const uploadTime = new Date(timestamp);
    const diffMs = now - uploadTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getImageUrl = (photo) => {
    return `${BACKEND_URL}${photo.thumbnail_url}`;
  };

  const getFullImageUrl = (photo) => {
    return `${BACKEND_URL}${photo.url}`;
  };

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-xl">Loading your photo wall...</p>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Event Photo Wall
              </h1>
              <p className="text-white/60 mt-1">Share your memories with everyone!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  <span>{stats.totalPhotos} photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{stats.todayPhotos} today</span>
                </div>
              </div>
              
              {/* Actions */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
                QR Code
              </button>
              
              <button
                onClick={fetchPhotos}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Upload Link</h2>
              <p className="text-gray-600">Scan to upload photos directly to this wall</p>
            </div>
            
            <QRCodeGenerator 
              value={`${window.location.origin}/upload`}
              size={250}
            />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Or share this link:</p>
              <div className="bg-gray-100 p-3 rounded-lg text-sm break-all">
                {window.location.origin}/upload
              </div>
              
              <button
                onClick={() => setShowQR(false)}
                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-red-200 mb-4">Failed to load photos</p>
            <button
              onClick={fetchPhotos}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && photos.length === 0 && (
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <Camera className="w-20 h-20 text-white/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No photos yet!</h2>
            <p className="text-white/60 mb-8">
              Be the first to share a photo with the group. Scan the QR code or click the button below to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
                Show QR Code
              </button>
              
              <Link
                to="/upload"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
                Upload Photos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="photos-masonry">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-item fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <img
                src={getImageUrl(photo)}
                alt={photo.original_filename}
                loading="lazy"
                onClick={() => window.open(getFullImageUrl(photo), '_blank')}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
              
              <div className="p-4">
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(photo.uploaded_at)}
                  </span>
                  <span>{(photo.file_size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                
                {photo.uploader_info && (
                  <div className="mt-2 text-white/80 text-sm">
                    <Users className="w-4 h-4 inline mr-1" />
                    {photo.uploader_info}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Upload Button */}
      <Link to="/upload" className="floating-btn">
        <Camera className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default PhotoWall;
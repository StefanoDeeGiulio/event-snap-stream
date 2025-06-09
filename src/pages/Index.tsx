
import React from 'react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Link } from 'react-router-dom';
import { Monitor, Upload as UploadIcon } from 'lucide-react';

const Index = () => {
  const uploadUrl = `${window.location.origin}/upload`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Event Photo Sharing
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Share your moments in real-time on the big screen
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* QR Code Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              For Guests: Scan to Upload Photos
            </h2>
            <div className="flex justify-center">
              <QRCodeDisplay value={uploadUrl} size={300} />
            </div>
            <p className="text-white/60 text-sm mt-4">
              Guest URL: {uploadUrl}
            </p>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center lg:text-left">
              Event Control Panel
            </h2>
            
            <div className="grid gap-4">
              <Link
                to="/wall"
                className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 group"
              >
                <Monitor className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-blue-300">
                    Display Wall
                  </h3>
                  <p className="text-white/70 text-sm">
                    Open the photo wall on your display screen
                  </p>
                </div>
              </Link>

              <Link
                to="/upload"
                className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 group"
              >
                <UploadIcon className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-green-300">
                    Upload Photos
                  </h3>
                  <p className="text-white/70 text-sm">
                    Direct access to photo upload page
                  </p>
                </div>
              </Link>
            </div>

            <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
              <h4 className="text-white font-medium mb-2">Setup Instructions:</h4>
              <ol className="text-white/70 text-sm space-y-1">
                <li>1. Open the Display Wall on your event screen</li>
                <li>2. Print or display this QR code for guests</li>
                <li>3. Guests scan and upload photos instantly</li>
                <li>4. Photos appear on the wall in real-time</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

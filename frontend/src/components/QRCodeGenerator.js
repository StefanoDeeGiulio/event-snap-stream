import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ value, size = 256 }) => {
  const canvasRef = useRef(null);
  const [qrError, setQrError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      setIsGenerating(true);
      setQrError(null);

      try {
        // Validate URL
        new URL(value);

        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setQrError(errorMessage);
        console.error('QR Code generation error:', errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [value, size]);

  if (qrError) {
    return (
      <div className="qr-container">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <span className="font-medium">QR Code Error</span>
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">
          Unable to generate QR Code. Use this link directly:
        </p>
        <div className="p-3 bg-gray-100 rounded-lg break-all text-sm mb-4">
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value}
          </a>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="qr-container">
      {isGenerating && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Generating QR Code...</span>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className={`border border-gray-200 rounded mx-auto ${isGenerating ? 'opacity-50' : 'opacity-100'}`} 
      />
      <p className="text-sm text-gray-600 text-center max-w-xs mx-auto mt-4">
        Scan this QR code to upload photos to the event wall
      </p>
    </div>
  );
};

export default QRCodeGenerator;
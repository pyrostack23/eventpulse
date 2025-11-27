import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { parseQRData } from '../utils/qrCodeGenerator';
import { attendanceAPI } from '../services/api';
import { toast } from 'react-toastify';
import './QRScanner.css';

const QRScanner = ({ eventId, onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      setScanning(true);
      
      // Use setTimeout to ensure state update and DOM render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Wait for video to be ready before scanning
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              scanQRCode();
            }).catch(err => {
              toast.error('Failed to start camera');
              console.error('Play error:', err);
            });
          };
        }
      }, 100);
    } catch (error) {
      toast.error('Camera access denied');
      console.error('Camera error:', error);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }
    }

    if (streamRef.current) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleQRCodeDetected = async (qrData) => {
    stopScanning();
    
    const parsed = parseQRData(qrData);
    
    if (!parsed || parsed.type !== 'EVENT_TICKET') {
      toast.error('Invalid QR code');
      return;
    }

    if (eventId && parsed.eventId !== eventId) {
      toast.error('QR code is for a different event');
      return;
    }

    try {
      const response = await attendanceAPI.markAttendance(parsed.registrationId);
      
      if (response.data.success) {
        setResult({
          success: true,
          userName: response.data.userName,
          eventName: response.data.eventName
        });
        toast.success('Attendance marked successfully!');
        if (onScanSuccess) onScanSuccess(response.data);
      } else {
        toast.error(response.data.message || 'Already checked in');
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
      console.error('Attendance error:', error);
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h3>Scan Event Ticket</h3>
        {scanning && (
          <button className="btn btn-secondary" onClick={stopScanning}>
            Stop Scanning
          </button>
        )}
      </div>

      {!result && (
        <>
          {!scanning ? (
            <div className="scanner-start">
              <button className="btn btn-primary" onClick={startScanning}>
                Start Camera
              </button>
            </div>
          ) : (
            <div className="scanner-video-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="scanner-overlay">
                <div className="scanner-frame"></div>
              </div>
            </div>
          )}
        </>
      )}

      {result && (
        <div className={`scan-result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <div className="success-icon">✓</div>
              <h3>Check-in Successful!</h3>
              <p><strong>{result.userName}</strong></p>
              <p>{result.eventName}</p>
            </>
          ) : (
            <>
              <div className="error-icon">✗</div>
              <h3>Check-in Failed</h3>
              <p>{result.message}</p>
            </>
          )}
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setResult(null);
              startScanning();
            }}
          >
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;

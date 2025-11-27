import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './UserQRCode.css';

const UserQRCode = ({ user }) => {
  // Use the user's permanent QR code from the database
  const qrData = user?.qrCode || user?._id || '';

  const downloadQR = () => {
    const svg = document.getElementById('user-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `${user?.name || 'user'}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="user-qr-code-container">
      <div className="qr-code-card">
        <h3>Your Profile QR Code</h3>
        <p>Scan this code to view your profile</p>
        
        <div className="qr-code-wrapper">
          <QRCodeSVG
            id="user-qr-code"
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <button className="btn btn-secondary" onClick={downloadQR}>
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default UserQRCode;

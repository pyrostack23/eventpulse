const QRCode = require('qrcode');

// Generate QR code as data URL
exports.generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as buffer
exports.generateQRCodeBuffer = async (data) => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    return qrCodeBuffer;
  } catch (error) {
    console.error('❌ Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code');
  }
};

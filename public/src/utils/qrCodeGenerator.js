import QRCode from 'qrcode.react';

export const generateUserQRData = (userId) => {
  return JSON.stringify({
    type: 'USER_PROFILE',
    userId: userId,
    timestamp: Date.now()
  });
};

export const generateEventTicketQRData = (userId, eventId, registrationId) => {
  return JSON.stringify({
    type: 'EVENT_TICKET',
    userId: userId,
    eventId: eventId,
    registrationId: registrationId,
    timestamp: Date.now()
  });
};

export const parseQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    return null;
  }
};

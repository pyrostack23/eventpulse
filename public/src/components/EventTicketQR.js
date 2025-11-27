import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './EventTicketQR.css';

const EventTicketQR = ({ registration }) => {
  // Use the unique registration QR code
  const qrData = registration?.qrCode || '';
  const event = registration?.event;
  const isExpired = event?.endDate ? new Date() > new Date(event.endDate) : false;
  const isPaid = registration?.paymentStatus === 'completed';
  const isFree = registration?.paymentStatus === 'not_required';
  const isPending = registration?.paymentStatus === 'pending';

  const downloadTicket = () => {
    const svg = document.getElementById(`ticket-qr-${registration?._id}`);
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
      downloadLink.download = `${registration?.event?.title || 'event'}-ticket-${registration?.ticketNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="event-ticket-qr">
      <div className="ticket-card">
        <div className="ticket-header">
          <h3>Event Ticket</h3>
          <span className={`ticket-status ${isExpired ? 'expired' : isPending ? 'pending' : 'confirmed'}`}>
            {isExpired ? 'Expired' : isPending ? 'Payment Pending' : 'Confirmed'}
          </span>
        </div>
        
        <div className="ticket-details">
          <div className="ticket-number">#{registration?.ticketNumber}</div>
          <h4>{event?.title}</h4>
          <p>{event?.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</p>
          {registration?.paymentAmount > 0 && (
            <div className="ticket-price">
              <span className="price-label">Amount Paid:</span>
              <span className="price-value">${registration.paymentAmount.toFixed(2)}</span>
            </div>
          )}
          {isFree && (
            <div className="ticket-free">
              <span className="free-badge">FREE EVENT</span>
            </div>
          )}
        </div>
        
        <div className="ticket-qr-wrapper">
          <QRCodeSVG
            id={`ticket-qr-${registration?._id}`}
            value={qrData}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="ticket-info">
          {isExpired ? (
            <p className="ticket-warning">⚠️ This ticket has expired</p>
          ) : isPending ? (
            <p className="ticket-warning">⚠️ Complete payment to activate ticket</p>
          ) : (
            <p>✓ Show this QR code at the event entrance</p>
          )}
        </div>
        
        <div className="ticket-actions">
          <button 
            className="btn btn-primary" 
            onClick={downloadTicket}
            disabled={isPending || isExpired}
          >
            {isPending ? 'Payment Required' : isExpired ? 'Ticket Expired' : 'Download Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventTicketQR;

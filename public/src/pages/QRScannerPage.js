import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import QRScanner from '../components/QRScanner';
import './QRScannerPage.css';

const QRScannerPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleScanSuccess = (data) => {
    setScanHistory(prev => [{
      ...data,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  return (
    <div className="qr-scanner-page">
      <div className="container">
        <div className="page-header">
          <h1>QR Code Scanner</h1>
          <p>Scan event tickets to mark attendance</p>
        </div>

        <div className="scanner-layout">
          <div className="scanner-section">
            <div className="event-selector">
              <label>Select Event:</label>
              <select 
                value={selectedEvent || ''} 
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="form-select"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <QRScanner 
              eventId={selectedEvent} 
              onScanSuccess={handleScanSuccess}
            />
          </div>

          <div className="history-section">
            <h3>Scan History</h3>
            {scanHistory.length === 0 ? (
              <div className="empty-history">
                <p>No scans yet</p>
              </div>
            ) : (
              <div className="history-list">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="history-item">
                    <div className="history-icon">✓</div>
                    <div className="history-details">
                      <strong>{scan.userName}</strong>
                      <p>{scan.eventName}</p>
                      <span className="history-time">{scan.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;


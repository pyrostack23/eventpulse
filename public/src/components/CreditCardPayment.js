import React, { useState, useEffect } from 'react';
import './CreditCardPayment.css';

const CreditCardPayment = ({ eventTitle, eventPrice, onPaymentSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Format card number display
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    return limited;
  };

  // Format expiry date display
  const formatExpiryDisplay = () => {
    if (!expiryDate) return '06/28';
    const parts = expiryDate.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(2);
      const month = parts[1];
      return `${month}/${year}`;
    }
    return '06/28';
  };

  // Get card number display array
  const getCardNumberDisplay = () => {
    const formatted = formatCardNumber(cardNumber);
    const display = [];
    for (let i = 0; i < 16; i++) {
      display.push(formatted[i] || '_');
    }
    return display;
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value.slice(0, 16));
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  // Handle card name input
  const handleCardNameChange = (e) => {
    const value = e.target.value.slice(0, 30);
    setCardName(value);
    if (errors.cardName) {
      setErrors({ ...errors, cardName: '' });
    }
  };

  // Handle expiry date input
  const handleExpiryDateChange = (e) => {
    setExpiryDate(e.target.value);
    if (errors.expiryDate) {
      setErrors({ ...errors, expiryDate: '' });
    }
  };

  // Handle CVV input
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
    if (errors.cvv) {
      setErrors({ ...errors, cvv: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!cardNumber || cardNumber.length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!cardName || cardName.trim().length < 3) {
      newErrors.cardName = 'Please enter the cardholder name';
    }

    if (!expiryDate) {
      newErrors.expiryDate = 'Please select expiry date';
    } else {
      const selectedDate = new Date(expiryDate);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    // Simulate payment processing (2 seconds)
    setTimeout(() => {
      setProcessing(false);
      // All payments succeed in test mode
      onPaymentSuccess({
        cardNumber: `****${cardNumber.slice(-4)}`,
        cardName,
        amount: eventPrice,
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  // Reset form on mount
  useEffect(() => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setErrors({});
  }, []);

  const cardNumberDisplay = getCardNumberDisplay();

  return (
    <div className="credit-card-payment-wrapper">
      <div className="payment-header">
        <h2>Payment Details</h2>
        <p className="payment-subtitle">Complete your registration for {eventTitle}</p>
        <div className="payment-amount">
          <span>Total Amount:</span>
          <span className="amount">${eventPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="credit-card-container">
        {/* Credit Card Preview */}
        <div className={`credit-card ${isFlipped ? 'flipped' : ''}`} id="card">
          <div className="card-front">
            <div className="branding">
              <div className="chip-img">
                <svg viewBox="0 0 40 30" fill="none">
                  <rect width="40" height="30" rx="4" fill="#FFD700"/>
                  <rect x="5" y="5" width="10" height="8" rx="1" fill="#FFA500"/>
                  <rect x="17" y="5" width="10" height="8" rx="1" fill="#FFA500"/>
                  <rect x="5" y="15" width="10" height="8" rx="1" fill="#FFA500"/>
                  <rect x="17" y="15" width="10" height="8" rx="1" fill="#FFA500"/>
                </svg>
              </div>
              <div className="visa-logo">
                <svg viewBox="0 0 48 16" fill="white">
                  <text x="0" y="12" fontSize="14" fontWeight="bold">VISA</text>
                </svg>
              </div>
            </div>
            <div className="card-number">
              <div>
                {cardNumberDisplay.slice(0, 4).map((digit, i) => (
                  <span key={i} className="card-number-display">{digit}</span>
                ))}
              </div>
              <div>
                {cardNumberDisplay.slice(4, 8).map((digit, i) => (
                  <span key={i} className="card-number-display">{digit}</span>
                ))}
              </div>
              <div>
                {cardNumberDisplay.slice(8, 12).map((digit, i) => (
                  <span key={i} className="card-number-display">{digit}</span>
                ))}
              </div>
              <div>
                {cardNumberDisplay.slice(12, 16).map((digit, i) => (
                  <span key={i} className="card-number-display">{digit}</span>
                ))}
              </div>
            </div>
            <div className="details">
              <div>
                <span>Card Holder</span>
                <span id="card-holder-name">
                  {cardName || 'Your Name Here'}
                </span>
              </div>
              <div>
                <span>Expires</span>
                <span id="validity">{formatExpiryDisplay()}</span>
              </div>
            </div>
          </div>
          <div className="card-back">
            <div className="black-strip"></div>
            <div className="white-strip">
              <span>CVV</span>
              <div id="cvv-display">{cvv || '***'}</div>
            </div>
            <div className="visa-logo">
              <svg viewBox="0 0 48 16" fill="white">
                <text x="0" y="12" fontSize="14" fontWeight="bold">VISA</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="card-number">Card Number</label>
            <input
              type="text"
              id="card-number"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className={errors.cardNumber ? 'error' : ''}
              maxLength="16"
            />
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="card-name-input">Card Holder Name</label>
            <input
              type="text"
              id="card-name-input"
              value={cardName}
              onChange={handleCardNameChange}
              placeholder="John Doe"
              className={errors.cardName ? 'error' : ''}
            />
            {errors.cardName && <span className="error-message">{errors.cardName}</span>}
          </div>

          <div className="date-cvv">
            <div className="form-group">
              <label htmlFor="validity-input">Expiry Date</label>
              <input
                type="date"
                id="validity-input"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                className={errors.expiryDate ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={handleCvvChange}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                placeholder="123"
                className={errors.cvv ? 'error' : ''}
                maxLength="3"
              />
              {errors.cvv && <span className="error-message">{errors.cvv}</span>}
            </div>
          </div>

          <div className="payment-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  Processing...
                </>
              ) : (
                `Pay $${eventPrice.toFixed(2)}`
              )}
            </button>
          </div>

          <div className="payment-security">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your payment information is secure and encrypted</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardPayment;

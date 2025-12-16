import React, { useState } from 'react';

// M-Pesa STK Push Payment Component
// This component provides a secure frontend interface for initiating M-Pesa STK Push payments
// It integrates with a backend API that handles the actual M-Pesa integration

const MpesaPayment = () => {
  // State management for form inputs and UI states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Backend URL from environment variable
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Helper function to normalize Kenyan phone numbers to 2547XXXXXXXX format
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('254')) {
      // Already in 254 format, ensure it's 12 digits
      return cleaned.length === 12 ? cleaned : null;
    } else if (cleaned.startsWith('0')) {
      // Starts with 0, convert to 254
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      // Starts with 7 or 1, assume it's missing 254
      return '254' + cleaned;
    }

    return null; // Invalid format
  };

  // Input validation function
  // Validates phone number and amount before API call
  const validateInputs = () => {
    const errors = {};

    // Phone number validation
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else {
      const normalized = normalizePhoneNumber(phoneNumber);
      if (!normalized || !/^254[17]\d{8}$/.test(normalized)) {
        errors.phoneNumber = 'Please enter a valid Kenyan phone number';
      }
    }

    // Amount validation
    if (!amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.amount = 'Please enter a valid positive amount';
      } else if (numAmount < 1) {
        errors.amount = 'Minimum amount is KSH 1';
      } else if (numAmount > 150000) {
        errors.amount = 'Maximum amount is KSH 150,000';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  // Validates inputs, makes API call, handles responses
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate inputs first
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      // Normalize phone number and prepare request data
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const requestData = {
        phoneNumber: normalizedPhone,
        amount: parseFloat(amount).toFixed(2) // Optimized parsing with toFixed for precision
      };

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Make API request
      const response = await fetch(`${BACKEND_URL}/api/mpesa/stk-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle response
      if (response.ok) {
        const data = await response.json();
        setSuccess('Check your phone to complete payment');
        // Clear form on success
        setPhoneNumber('');
        setAmount('');
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to send STK Push. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Ignore parse errors, use default message
        }
        setError(errorMessage);
      }

    } catch (err) {
      // Handle different types of errors
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      // Log error for debugging (without sensitive data)
      console.error('Payment request failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes and clear validation errors
  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (validationErrors.amount) {
      setValidationErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>M-Pesa Payment</h2>
        <p style={styles.description}>
          Enter your phone number and amount to receive an M-Pesa STK Push for payment.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Phone Number Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="phoneNumber" style={styles.label}>
              Phone Number *
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="e.g., 0712345678 or +254712345678"
              style={{
                ...styles.input,
                borderColor: validationErrors.phoneNumber ? '#e74c3c' : '#ddd'
              }}
              disabled={loading}
            />
            {validationErrors.phoneNumber && (
              <span style={styles.errorText}>{validationErrors.phoneNumber}</span>
            )}
          </div>

          {/* Amount Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="amount" style={styles.label}>
              Amount (KSH) *
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="e.g., 100.00"
              min="1"
              max="150000"
              step="0.01"
              style={{
                ...styles.input,
                borderColor: validationErrors.amount ? '#e74c3c' : '#ddd'
              }}
              disabled={loading}
            />
            {validationErrors.amount && (
              <span style={styles.errorText}>{validationErrors.amount}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending STK Push...' : 'Send Payment Request'}
          </button>
        </form>

        {/* Success Message */}
        {success && (
          <div style={styles.successMessage}>
            <div style={styles.successIcon}>✓</div>
            <p>{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <div style={styles.errorIcon}>⚠</div>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #e1e5e9'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    textAlign: 'center'
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    textAlign: 'center',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  },
  button: {
    padding: '14px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px'
  },
  errorText: {
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '4px'
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    marginTop: '20px'
  },
  successIcon: {
    color: '#28a745',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    marginTop: '20px'
  },
  errorIcon: {
    color: '#dc3545',
    fontSize: '18px'
  }
};

export default MpesaPayment;
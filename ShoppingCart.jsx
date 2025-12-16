import React, { useState } from 'react';

// Shopping Cart with M-Pesa STK Push Integration
// This component manages a shopping cart and integrates M-Pesa payments
// It displays products, allows deletion, calculates totals, and handles STK Push payments

const ShoppingCart = () => {
  // Cart state: array of products with id, name, price, quantity
  const [cart, setCart] = useState([
    { id: 1, name: 'Sample Product 1', price: 100, quantity: 1 },
    { id: 2, name: 'Sample Product 2', price: 200, quantity: 2 }
  ]);

  // Payment states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add product form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // Backend URL from environment variable
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fixed phone number for payment (as per requirements)
  const PAYMENT_PHONE = '254708799547';

  // Helper function to calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `KSH ${amount.toFixed(2)}`;
  };

  // Add product to cart
  const addProduct = () => {
    if (!newProductName.trim() || !newProductPrice.trim()) {
      return;
    }

    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    const newProduct = {
      id: Date.now(), // Simple ID generation
      name: newProductName.trim(),
      price: price,
      quantity: 1
    };

    setCart(prev => [...prev, newProduct]);
    setNewProductName('');
    setNewProductPrice('');
  };

  // Remove product from cart
  const removeProduct = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    // Clear any previous messages
    setError('');
    setSuccess('');
  };

  // Handle M-Pesa payment
  const handlePayment = async () => {
    const total = calculateTotal();

    // Validate total amount
    if (total <= 0) {
      setError('Cart is empty. Add products before payment.');
      return;
    }

    // Clear previous messages
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare request data
      const requestData = {
        phoneNumber: PAYMENT_PHONE,
        amount: total.toFixed(2)
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
        setSuccess('STK Push sent! Check your phone to complete payment.');
        // Clear cart on successful payment initiation
        setCart([]);
      } else {
        // Try to get error message from response
        let errorMessage = 'Payment failed. Please try again.';
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

  const total = calculateTotal();

  return (
    <div style={styles.container}>
      <div style={styles.cart}>
        <h1 style={styles.title}>Shopping Cart</h1>

        {/* Add Product Section */}
        <div style={styles.addProduct}>
          <h3>Add Product</h3>
          <div style={styles.addForm}>
            <input
              type="text"
              placeholder="Product name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Price"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              min="0.01"
              step="0.01"
              style={styles.input}
            />
            <button onClick={addProduct} style={styles.addButton}>
              Add to Cart
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div style={styles.items}>
          {cart.length === 0 ? (
            <p style={styles.emptyCart}>Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemDetails}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <p style={styles.itemPrice}>
                    {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => removeProduct(item.id)}
                  style={styles.deleteButton}
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total and Payment */}
        {cart.length > 0 && (
          <div style={styles.totalSection}>
            <div style={styles.total}>
              <strong>Total: {formatCurrency(total)}</strong>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                ...styles.payButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing Payment...' : 'Pay with M-Pesa'}
            </button>
          </div>
        )}

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
  cart: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
    border: '1px solid #e1e5e9'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    textAlign: 'center'
  },
  addProduct: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  addForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    flex: '1',
    minWidth: '120px'
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  items: {
    marginBottom: '24px'
  },
  emptyCart: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: '40px 0'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease'
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a1a1a'
  },
  itemPrice: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },
  totalSection: {
    borderTop: '2px solid #e9ecef',
    paddingTop: '20px',
    marginBottom: '20px'
  },
  total: {
    fontSize: '20px',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#1a1a1a'
  },
  payButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
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

export default ShoppingCart;
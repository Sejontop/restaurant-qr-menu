// frontend/src/pages/Cart.js
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate , useLocation} from 'react-router-dom';
import { CartContext } from '../context/CartContext';


const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api/menu/:tableIdentifier';


function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, tableInfo, updateQuantity, removeFromCart, clearCart, getTotal } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log table info on component mount
  useEffect(() => {
    console.log('Cart - tableInfo:', tableInfo);
    console.log('Cart - localStorage tableInfo:', localStorage.getItem('tableSlug'));
    
    // If no table info, check if we came from a menu page
    if (!tableInfo) {
      const savedTable = localStorage.getItem('tableInfo');
      if (!savedTable) {
        setError('Table information is missing. Please scan the QR code again.');
      }
    }
  }, [tableInfo]);

  const handlePlaceOrder = async () => {
    if (!tableInfo) {
      setError('Table information missing');
      return;
    }

    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3000/api/orders/${tableInfo.tableNumber}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tableId: tableInfo._id,
          items: cart
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to place order');
      }

      // Store the order ID in localStorage
      if (data?.order?._id) {
         const tableIdentifier = tableInfo?.tableNumber || qrSlug;
      localStorage.setItem(`lastOrder_table_${tableIdentifier}`, data.order._id);
        
      }

      // Clear cart
      clearCart();

      // Navigate to order status page
      const orderId = data.order._id;
      const guestToken = data.guestToken;

      if (guestToken) {
        navigate(`/order/${orderId}?guestToken=${guestToken}`);
      } else {
        navigate(`/order/${orderId}`);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back to Menu
          </button>
          <h1 style={styles.title}>Your Cart</h1>
        </div>
        <div style={styles.emptyCart}>
          <div style={styles.emptyIcon}>🛒</div>
          <p style={styles.emptyText}>Your cart is empty</p>
          <button style={styles.browseButton} onClick={() => navigate(-1)}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.title}>Your Cart</h1>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {tableInfo && (
        <div style={styles.tableInfo}>
          <span style={styles.tableIcon}>🪑</span>
          <span>Table {tableInfo.tableNumber}</span>
        </div>
      )}

      <div style={styles.cartItems}>
        {cart.map((item, index) => (
          <div key={`${item.menuItemId}-${index}`} style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h3 style={styles.itemName}>{item.name}</h3>
              {item.note && <p style={styles.itemNote}>Note: {item.note}</p>}
              <p style={styles.itemPrice}>₹{item.price} each</p>
            </div>
            
            <div style={styles.quantityControls}>
              <button
                style={styles.quantityButton}
                onClick={() => updateQuantity(item.menuItemId, item.note, item.qty - 1)}
              >
                −
              </button>
              <span style={styles.quantity}>{item.qty}</span>
              <button
                style={styles.quantityButton}
                onClick={() => updateQuantity(item.menuItemId, item.note, item.qty + 1)}
              >
                +
              </button>
            </div>
            
            <div style={styles.itemActions}>
              <p style={styles.itemTotal}>₹{item.price * item.qty}</p>
              <button
                style={styles.removeButton}
                onClick={() => removeFromCart(item.menuItemId, item.note)}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Subtotal:</span>
          <span style={styles.summaryValue}>₹{getTotal().toFixed(2)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>GST (5%):</span>
          <span style={styles.summaryValue}>₹{(getTotal() * 0.05).toFixed(2)}</span>
        </div>
        <div style={{...styles.summaryRow, ...styles.totalRow}}>
          <strong style={styles.totalLabel}>Total:</strong>
          <strong style={styles.totalValue}>₹{(getTotal() * 1.05).toFixed(2)}</strong>
        </div>
      </div>

      <button
        style={{...styles.placeOrderButton, opacity: loading ? 0.7 : 1}}
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? '⏳ Placing Order...' : '🍽️ Place Order'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#333',
    fontWeight: '500'
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '24px',
    fontWeight: '700'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  tableInfo: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '500'
  },
  tableIcon: {
    fontSize: '20px'
  },
  emptyCart: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '24px'
  },
  browseButton: {
    padding: '12px 32px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  cartItems: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #eee',
    gap: '16px'
  },
  itemInfo: {
    flex: 1,
    minWidth: 0
  },
  itemName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  itemNote: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  },
  itemPrice: {
    margin: '4px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    border: '2px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantity: {
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '32px',
    textAlign: 'center'
  },
  itemActions: {
    textAlign: 'right'
  },
  itemTotal: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f44336',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  summary: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '16px'
  },
  summaryLabel: {
    color: '#666'
  },
  summaryValue: {
    color: '#333',
    fontWeight: '500'
  },
  totalRow: {
    paddingTop: '12px',
    borderTop: '2px solid #eee',
    marginTop: '8px'
  },
  totalLabel: {
    fontSize: '18px',
    color: '#333'
  },
  totalValue: {
    fontSize: '20px',
    color: '#4CAF50'
  },
  placeOrderButton: {
    width: '100%',
    padding: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }
};

export default Cart;
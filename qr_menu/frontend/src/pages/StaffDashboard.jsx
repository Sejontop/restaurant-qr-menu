// frontend/src/pages/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api/menu';

function StaffDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('placed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ status: filter });
      
      const response = await fetch(`${API_URL}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusButtons = [
    { value: 'placed', label: '📝 New Orders', color: '#ff9800' },
    { value: 'preparing', label: '👨‍🍳 Preparing', color: '#2196F3' },
    { value: 'ready', label: '✅ Ready', color: '#4CAF50' },
    { value: 'served', label: '🍽️ Served', color: '#9E9E9E' }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👨‍🍳 Staff Dashboard</h1>
          <p style={styles.subtitle}>Manage orders in real-time</p>
        </div>
        <button 
          style={styles.logoutButton} 
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
        >
          Logout
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterContainer}>
        {statusButtons.map(btn => (
          <button
            key={btn.value}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === btn.value ? btn.color : '#fff',
              color: filter === btn.value ? 'white' : '#333',
              borderColor: btn.color
            }}
            onClick={() => setFilter(btn.value)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.noOrders}>
          <span style={styles.noOrdersIcon}>📭</span>
          <p style={styles.noOrdersText}>No {filter} orders</p>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.map(order => (
            <div 
              key={order._id} 
              style={styles.orderCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              {/* Card Header */}
              <div style={styles.orderHeader}>
                <h3 style={styles.orderTitle}>
                  🪑 Table {order.tableId?.number || 'N/A'}
                </h3>
                <span style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Order Items */}
              <div style={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={styles.orderItem}>
                    <span style={styles.itemQty}>{item.qty}x</span>
                    <div style={styles.itemDetails}>
                      <span style={styles.itemName}>{item.name}</span>
                      {item.note && (
                        <span style={styles.itemNote}>📝 {item.note}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div style={styles.orderFooter}>
                <span style={styles.orderTotal}>₹{order.total}</span>
                <div style={styles.actionButtons}>
                  {order.status === 'placed' && (
                    <button
                      style={{...styles.actionButton, backgroundColor: '#2196F3'}}
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      👨‍🍳 Start
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      style={{...styles.actionButton, backgroundColor: '#4CAF50'}}
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      ✅ Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      style={{...styles.actionButton, backgroundColor: '#9E9E9E'}}
                      onClick={() => updateOrderStatus(order._id, 'served')}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      🍽️ Served
                    </button>
                  )}
                  {order.status !== 'served' && order.status !== 'canceled' && (
                    <button
                      style={{...styles.actionButton, backgroundColor: '#f44336', marginTop: '8px'}}
                      onClick={() => updateOrderStatus(order._id, 'canceled')}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '28px',
    borderRadius: '16px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '32px',
    color: '#333',
    fontWeight: '800'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666'
  },
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.3s'
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '14px 24px',
    border: '2px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px'
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px'
  },
  noOrders: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  noOrdersIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px'
  },
  noOrdersText: {
    color: '#666',
    fontSize: '18px',
    margin: 0
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0'
  },
  orderTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
    fontWeight: '700'
  },
  orderTime: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  orderItems: {
    marginBottom: '20px'
  },
  orderItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5'
  },
  itemQty: {
    backgroundColor: '#f0f0f0',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#666',
    minWidth: '40px',
    textAlign: 'center'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  itemNote: {
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '2px solid #f0f0f0'
  },
  orderTotal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#4CAF50'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  actionButton: {
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'opacity 0.3s',
    whiteSpace: 'nowrap'
  }
};

export default StaffDashboard;
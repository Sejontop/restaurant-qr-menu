// frontend/src/pages/StaffDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function StaffDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const lastOrderCountRef = useRef(0);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
// const filteredOrders = orders.filter(o => o.status === filter);

      const params = new URLSearchParams({ status: filter });
      
      const response = await fetch(`${API_URL}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      const newOrders = data.orders || [];

      // DEBUG: Log to see duplicates
      console.log('Filter:', filter);
      console.log('Orders received:', newOrders.length);
      console.log('Order IDs:', newOrders.map(o => o._id));

      // Remove duplicates by ID
      const uniqueOrders = Array.from(new Map(newOrders.map(order => [order._id, order])).values());
      console.log('Unique orders:', uniqueOrders.length);

      // Play sound for new orders when no specific filter is selected
      if (filter === '') {
        const newCount = uniqueOrders.length;
        if (newCount > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
          playNotificationSound();
        }
        lastOrderCountRef.current = newCount;
      }

      setOrders(uniqueOrders);
      setError(null);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
// Update getNextStatus function
const getNextStatus = (currentStatus) => {
  const flow = {
    pending: 'placed',
    placed: 'preparing',
    preparing: 'ready',
    ready: 'served'
  };
  return flow[currentStatus];
};

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusButtons = [
    { value:'pending',label:'⏳ Pending',color:'#bdbdbd'},
    { value: 'placed', label: '📝 New Orders', color: '#ff9800' },
    { value: 'preparing', label: '👨‍🍳 Preparing', color: '#2196F3' },
    { value: 'ready', label: '✅ Ready', color: '#4CAF50' },
    { value: 'served', label: '🍽️ Served', color: '#9E9E9E' }
  ];

  // Count orders by status
const getStatusCount = (status) => orders.filter(o => o.status === status).length;

  return (
    <div style={styles.container}>
      {/* Audio element for notifications */}
      <audio ref={audioRef}>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZVA4OVK3n8bFhGQc+ltryxHUpBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyy3krBSJ1xe/gkUALFF+06+yoVhQLRqHh8r9tIQU=" type="audio/wav" />
      </audio>

      {/* Header */}
      {/* <div style={styles.header}>
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
      </div> */}

      {/* Error message */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button style={styles.retryButton} onClick={loadOrders}>Retry</button>
        </div>
      )}

      {/* Filter Tabs */}
{/* // Update the grid to show 5 or 6 tabs */}
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
      <div style={styles.filterButtonContent}>
        <span>{btn.label}</span>
         <span style={styles.filterCount}>{getStatusCount(btn.value)}</span> 
      </div>
    </button>
  ))}
</div>
{/* <div style={styles.ordersContainer}>
  {filteredOrders.map(order => (
    <OrderCard key={order._id} order={order} />
  ))}
</div> */}
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.noOrders}>
          <span style={styles.noOrdersIcon}>📭</span>
          <p style={styles.noOrdersText}>No {filter} orders</p>
          <p style={styles.noOrdersSubtext}>Orders will appear here automatically</p>
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
                <div>
                  <h3 style={styles.orderTitle}>
                    🪑 Table {order.table?.tableNumber || order.table?.number || 'N/A'}
                  </h3>
                  <span style={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: statusButtons.find(s => s.value === order.status)?.color || '#999'
                }}>
                  {order.status}
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
                <span style={styles.orderTotal}>₹{order.totalPrice?.toFixed(2) || order.totalPrice}</span>
                <div style={styles.actionButtons}>

{/*  Update the action button rendering */}
{order.status === 'pending' && (
  <button
    style={{...styles.actionButton, backgroundColor: '#ff9800'}}
    onClick={() => updateOrderStatus(order._id, 'placed')}
    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
    onMouseLeave={(e) => e.target.style.opacity = '1'}
  >
    📝 Accept Order
  </button>
)}
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
{/*  ... rest of the buttons */}
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
                      onClick={() => {
                        if (window.confirm('Cancel this order?')) {
                          updateOrderStatus(order._id, 'canceled');
                        }
                      }}
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

      {/* Add CSS for loader animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
  errorBanner: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '16px 24px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(198,40,40,0.15)'
  },
  retryButton: {
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    flex: '1',
    minWidth: '200px'
  },
  filterButtonContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  filterCount: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700'
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
    color: '#333',
    fontSize: '20px',
    margin: '0 0 8px 0',
    fontWeight: '600'
  },
  noOrdersSubtext: {
    color: '#999',
    fontSize: '14px',
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
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0'
  },
  orderTitle: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    color: '#333',
    fontWeight: '700'
  },
  orderTime: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase'
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
    textAlign: 'center',
    height: 'fit-content'
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
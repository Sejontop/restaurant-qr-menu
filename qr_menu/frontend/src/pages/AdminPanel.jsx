// frontend/src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuManager from './MenuManager';
import TableManager from './TableManager';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Admin Panel</h1>
          <p style={styles.subtitle}>Manage your restaurant</p>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        {['dashboard', 'menu', 'tables'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' && '📊'} 
            {tab === 'menu' && '🍽️'} 
            {tab === 'tables' && '🪑'}
            {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div style={styles.dashboardGrid}>
            <div 
              style={styles.dashboardCard}
              onClick={() => setActiveTab('menu')}
            >
              <span style={styles.dashboardIcon}>🍽️</span>
              <h3 style={styles.dashboardTitle}>Menu Management</h3>
              <p style={styles.dashboardDesc}>
                Manage menu items and categories
              </p>
              <button style={styles.dashboardButton}>Go to Menu →</button>
            </div>

            <div 
              style={styles.dashboardCard}
              onClick={() => setActiveTab('tables')}
            >
              <span style={styles.dashboardIcon}>🪑</span>
              <h3 style={styles.dashboardTitle}>Table Management</h3>
              <p style={styles.dashboardDesc}>
                Manage tables and QR codes
              </p>
              <button style={styles.dashboardButton}>Go to Tables →</button>
            </div>

            <div 
              style={styles.dashboardCard}
              onClick={() => navigate('/staff')}
            >
              <span style={styles.dashboardIcon}>👨‍🍳</span>
              <h3 style={styles.dashboardTitle}>Staff Dashboard</h3>
              <p style={styles.dashboardDesc}>
                View and manage orders
              </p>
              <button style={styles.dashboardButton}>Go to Staff →</button>
            </div>
          </div>
        )}

        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'tables' && <TableManager />}
      </div>
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
    fontWeight: '600'
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  tab: {
    flex: 1,
    padding: '14px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: '#666',
    transition: 'all 0.3s'
  },
  activeTab: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  content: {
    backgroundColor: 'transparent'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  dashboardCard: {
    backgroundColor: 'white',
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center'
  },
  dashboardIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px'
  },
  dashboardTitle: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#333'
  },
  dashboardDesc: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  },
  dashboardButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  }
};

export default AdminPanel;
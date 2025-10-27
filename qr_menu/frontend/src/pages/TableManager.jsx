// frontend/src/pages/TableManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function TableManager() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: '', qrSlug: '' });

  useEffect(() => {
    loadTables();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tables`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to load tables');

      const data = await response.json();
      console.log('Tables loaded:', data); // Debug log
      setTables(data); // setTables(data.tables) in this backend expects {table: [table array] } but this is not the response...(data); [table array only ]  simpler, if your backend always returns a direct array:
    } catch (error) {
      console.error('Load tables error:', error);
      alert('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tableForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create table');
      }

      loadTables();
      closeModal();
    } catch (error) {
      alert(error.message || 'Failed to create table');
    }
  };

  const downloadQR = async (tableId, tableNumber) => {
    try {
      const response = await fetch(`${API_URL}/tables/${tableId}/qr`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      const data = await response.json();

      // Create download link
      const link = document.createElement('a');
      link.href = data.qrCodeUrl;
      link.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`QR Code for Table ${tableNumber} downloaded!`);
    } catch (error) {
      alert('Failed to download QR code');
    }
  };

  const downloadAllQRs = async () => {
    if (!window.confirm('Download QR codes for all tables?')) return;

    for (const table of tables) {
      await downloadQR(table._id, table.tableNumber || table.number);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const copyMenuLink = (table) => {
    const menuUrl = `${window.location.origin}/m/${table.qrSlug}`;
    navigator.clipboard.writeText(menuUrl);
    alert(`Menu link copied for Table ${table.tableNumber || table.number}!`);
  };

  const openModal = () => {
    setTableForm({ tableNumber: '', qrSlug: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTableForm({ tableNumber: '', qrSlug: '' });
  };

  return (
    <div style={styles.container}>
      {/* Actions Bar */}
      <div style={styles.actionsBar}>
        <div style={styles.statsCard}>
          <span style={styles.statsNumber}>{tables.length}</span>
          <span style={styles.statsLabel}>Total Tables</span>
        </div>
        <div style={styles.actionButtons}>
          {tables.length > 0 && (
            <button style={styles.downloadAllButton} onClick={downloadAllQRs}>
              📥 Download All QR Codes
            </button>
          )}
          <button style={styles.addButton} onClick={openModal}>
            + Add Table
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading tables...</p>
        </div>
      ) : tables.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🪑</span>
          <h3 style={styles.emptyTitle}>No tables yet</h3>
          <p style={styles.emptyText}>Create your first table to generate QR codes</p>
          <button style={styles.emptyButton} onClick={openModal}>
            + Create First Table
          </button>
        </div>
      ) : (
        <div style={styles.tablesGrid}>
          {tables.map((table) => (
            <div key={table._id} style={styles.tableCard}>
              {/* Table Number Badge */}
              <div style={styles.tableHeader}>
                <div style={styles.tableNumberBadge}>
                  <span style={styles.tableIcon}>🪑</span>
                  <span style={styles.tableNumber}>
                    Table {table.tableNumber || table.number}
                  </span>
                </div>
                <div style={styles.statusIndicator}>
                  {table.activeSessionId ? (
                    <span style={styles.activeStatus}>● Active</span>
                  ) : (
                    <span style={styles.inactiveStatus}>○ Inactive</span>
                  )}
                </div>
              </div>

              {/* QR Slug */}
              <div style={styles.slugContainer}>
                <label style={styles.slugLabel}>QR Slug:</label>
                <code style={styles.slugCode}>{table.qrSlug}</code>
              </div>

              {/* Menu Link */}
              <div style={styles.linkContainer}>
                <label style={styles.linkLabel}>Menu Link:</label>
                <div style={styles.linkBox}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/m/${table.qrSlug}`}
                    style={styles.linkInput}
                  />
                  <button
                    style={styles.copyButton}
                    onClick={() => copyMenuLink(table)}
                    title="Copy link"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.cardActions}>
                <button
                  style={styles.qrButton}
                  onClick={() => downloadQR(table._id, table.tableNumber || table.number)}
                >
                  📥 Download QR
                </button>
                <button
                  style={styles.previewButton}
                  onClick={() => window.open(`/m/${table.qrSlug}`, '_blank')}
                >
                  👁️ Preview Menu
                </button>
              </div>

              {/* Metadata */}
              <div style={styles.metadata}>
                <span style={styles.metaItem}>
                  Created: {new Date(table.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Table Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Table</h2>
              <button style={styles.closeButton} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleCreateTable} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Table Number *</label>
                <input
                  type="number"
                  style={styles.input}
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  placeholder="Enter table number (e.g., 1, 2, 3...)"
                  required
                  autoFocus
                  min="1"
                />
                <span style={styles.helper}>The table number displayed to customers</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>QR Slug (Optional)</label>
                <input
                  type="text"
                  style={styles.input}
                  value={tableForm.qrSlug}
                  onChange={(e) => setTableForm({ ...tableForm, qrSlug: e.target.value })}
                  placeholder="Leave blank for auto-generate"
                />
                <span style={styles.helper}>
                  Custom URL slug for the QR code. If left blank, a unique slug will be auto-generated.
                </span>
              </div>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>ℹ️</span>
                <div>
                  <strong>What happens next?</strong>
                  <p style={styles.infoText}>
                    After creating the table, you'll be able to download a QR code that customers can scan 
                    to view the menu and place orders for this specific table.
                  </p>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  statsCard: {
    backgroundColor: 'white',
    padding: '20px 32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statsNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#667eea',
    lineHeight: 1
  },
  statsLabel: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px'
  },
  downloadAllButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
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
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  emptyIcon: {
    fontSize: '80px',
    display: 'block',
    marginBottom: '20px'
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    color: '#333',
    fontWeight: '700'
  },
  emptyText: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#666'
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0'
  },
  tableNumberBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tableIcon: {
    fontSize: '28px'
  },
  tableNumber: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#333'
  },
  statusIndicator: {
    fontSize: '14px',
    fontWeight: '600'
  },
  activeStatus: {
    color: '#4CAF50'
  },
  inactiveStatus: {
    color: '#999'
  },
  slugContainer: {
    marginBottom: '16px'
  },
  slugLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '6px'
  },
  slugCode: {
    display: 'block',
    padding: '10px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#667eea',
    wordBreak: 'break-all'
  },
  linkContainer: {
    marginBottom: '20px'
  },
  linkLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '6px'
  },
  linkBox: {
    display: 'flex',
    gap: '8px'
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    color: '#333'
  },
  copyButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },
  qrButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  previewButton: {
    backgroundColor: '#fff',
    color: '#667eea',
    border: '2px solid #667eea',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  metadata: {
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0'
  },
  metaItem: {
    fontSize: '12px',
    color: '#999'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '550px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #f0f0f0'
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#333'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#999',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1
  },
  form: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  helper: {
    display: 'block',
    marginTop: '6px',
    fontSize: '13px',
    color: '#999',
    lineHeight: '1.4'
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196F3',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    gap: '12px'
  },
  infoIcon: {
    fontSize: '24px'
  },
  infoText: {
    margin: '8px 0 0 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '24px',
    borderTop: '2px solid #f0f0f0'
  },
  cancelButton: {
    padding: '12px 24px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#666',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  },
  saveButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  }
};

export default TableManager;
// frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'category', 'item', 'table'
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', displayOrder: 0, active: true });
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', categoryId: '', imageUrl: '', availability: true, tags: ''
  });
  const [tableForm, setTableForm] = useState({ number: '', qrSlug: '' });

  useEffect(() => {
    loadData();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [catRes, itemRes, tableRes] = await Promise.all([
        fetch(`${API_URL}/menu/categories/all`),
        fetch(`${API_URL}/menu/items/search?availability=`),
        fetch(`${API_URL}/tables`, { headers: getAuthHeaders() })
      ]);

      if (catRes.status === 401 || itemRes.status === 401 || tableRes.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const catData = await catRes.json();
      const itemData = await itemRes.json();
      const tableData = await tableRes.json();

      setCategories(catData.categories || []);
      setMenuItems(itemData.items || []);
      setTables(tableData.tables || []);
    } catch (error) {
      console.error('Load data error:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_URL}/menu/categories/${editingItem._id}`
        : `${API_URL}/menu/categories`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryForm)
      });

      if (!response.ok) throw new Error('Failed to save');

      loadData();
      closeModal();
    } catch (error) {
      alert('Failed to save category');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        tags: itemForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const url = editingItem
        ? `${API_URL}/menu/items/${editingItem._id}`
        : `${API_URL}/menu/items`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData)
      });

      if (!response.ok) throw new Error('Failed to save');

      loadData();
      closeModal();
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tableForm)
      });

      if (!response.ok) throw new Error('Failed to create');

      loadData();
      closeModal();
    } catch (error) {
      alert('Failed to create table');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;

    try {
      const endpoints = {
        category: `/menu/categories/${id}`,
        item: `/menu/items/${id}`
      };

      const response = await fetch(`${API_URL}${endpoints[type]}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete');
      }

      loadData();
    } catch (error) {
      alert(error.message || `Failed to delete ${type}`);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const response = await fetch(`${API_URL}/menu/items/${item._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...item, availability: !item.availability })
      });

      if (!response.ok) throw new Error('Failed to update');

      loadData();
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  const downloadQR = async (tableId, tableNumber) => {
    try {
      const response = await fetch(`${API_URL}/tables/${tableId}/qr`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to generate QR');

      const data = await response.json();

      // Create download link
      const link = document.createElement('a');
      link.href = data.qrCodeUrl;
      link.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Failed to download QR code');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'category') {
      setCategoryForm(item || { name: '', displayOrder: 0, active: true });
    } else if (type === 'item') {
      setItemForm(item ? {
        ...item,
        categoryId: item.categoryId?._id || item.categoryId || '',
        tags: item.tags?.join(', ') || ''
      } : {
        name: '', description: '', price: '', categoryId: '', imageUrl: '', availability: true, tags: ''
      });
    } else if (type === 'table') {
      setTableForm({ number: '', qrSlug: '' });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

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
          <p style={styles.subtitle}>Manage menu, categories & tables</p>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        {['menu', 'categories', 'tables'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'menu' && '🍽️'} {tab === 'categories' && '📂'} {tab === 'tables' && '🪑'}
            {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Menu Items Tab */}
          {activeTab === 'menu' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Menu Items ({menuItems.length})</h2>
                <button style={styles.addButton} onClick={() => openModal('item')}>
                  + Add Item
                </button>
              </div>

              <div style={styles.grid}>
                {menuItems.map(item => (
                  <div key={item._id} style={styles.card}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
                    )}
                    <div style={styles.cardContent}>
                      <div style={styles.itemHeader}>
                        <h3 style={styles.itemName}>{item.name}</h3>
                        <span style={styles.itemPrice}>₹{item.price}</span>
                      </div>
                      <p style={styles.itemDescription}>{item.description}</p>
                      <div style={styles.itemMeta}>
                        <span style={styles.badge}>
                          {categories.find(c => c._id === (item.categoryId?._id || item.categoryId))?.name || 'No Category'}
                        </span>
                        <button
                          style={{
                            ...styles.badge,
                            ...(item.availability ? styles.availableBadge : styles.unavailableBadge)
                          }}
                          onClick={() => toggleAvailability(item)}
                        >
                          {item.availability ? '✓ Available' : '✗ Unavailable'}
                        </button>
                      </div>
                      <div style={styles.cardActions}>
                        <button style={styles.editButton} onClick={() => openModal('item', item)}>
                          Edit
                        </button>
                        <button style={styles.deleteButton} onClick={() => handleDelete('item', item._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {menuItems.length === 0 && (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: '48px' }}>🍽️</span>
                  <p>No menu items yet</p>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Categories ({categories.length})</h2>
                <button style={styles.addButton} onClick={() => openModal('category')}>
                  + Add Category
                </button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Display Order</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat._id} style={styles.tr}>
                        <td style={styles.td}>{cat.name}</td>
                        <td style={styles.td}>{cat.displayOrder}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(cat.active ? styles.availableBadge : styles.unavailableBadge)
                          }}>
                            {cat.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.tableEditButton} onClick={() => openModal('category', cat)}>
                            Edit
                          </button>
                          <button style={styles.tableDeleteButton} onClick={() => handleDelete('category', cat._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {categories.length === 0 && (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: '48px' }}>📂</span>
                  <p>No categories yet</p>
                </div>
              )}
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Tables ({tables.length})</h2>
                <button style={styles.addButton} onClick={() => openModal('table')}>
                  + Add Table
                </button>
              </div>

              <div style={styles.grid}>
                {tables.map(table => (
                  <div key={table._id} style={styles.tableCard}>
                    <div style={styles.tableCardHeader}>
                      <h3 style={styles.tableNumber}>🪑 Table {table.number}</h3>
                      <span style={styles.tableSlug}>{table.qrSlug}</span>
                    </div>
                    <button
                      style={styles.qrButton}
                      onClick={() => downloadQR(table._id, table.number)}
                    >
                      📥 Download QR Code
                    </button>
                  </div>
                ))}
              </div>

              {tables.length === 0 && (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: '48px' }}>🪑</span>
                  <p>No tables yet</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add'} {modalType === 'item' ? 'Menu Item' : modalType === 'category' ? 'Category' : 'Table'}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>✕</button>
            </div>

            {modalType === 'category' && (
              <form onSubmit={handleSaveCategory} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    style={styles.input}
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Display Order</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={categoryForm.active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={closeModal}>Cancel</button>
                  <button type="submit" style={styles.saveButton}>Save</button>
                </div>
              </form>
            )}

            {modalType === 'item' && (
              <form onSubmit={handleSaveItem} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    style={styles.input}
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{ ...styles.input, minHeight: '80px' }}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      style={styles.input}
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      style={styles.input}
                      value={itemForm.categoryId}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Image URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tags (comma separated)</label>
                  <input
                    style={styles.input}
                    value={itemForm.tags}
                    onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                    placeholder="spicy, vegetarian, popular"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={itemForm.availability}
                      onChange={(e) => setItemForm({ ...itemForm, availability: e.target.checked })}
                    />
                    Available
                  </label>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={closeModal}>Cancel</button>
                  <button type="submit" style={styles.saveButton}>Save</button>
                </div>
              </form>
            )}

            {modalType === 'table' && (
              <form onSubmit={handleSaveTable} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Table Number *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>QR Slug (optional)</label>
                  <input
                    style={styles.input}
                    value={tableForm.qrSlug}
                    onChange={(e) => setTableForm({ ...tableForm, qrSlug: e.target.value })}
                    placeholder="Leave blank for auto-generate"
                  />
                </div>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={closeModal}>Cancel</button>
                  <button type="submit" style={styles.saveButton}>Create</button>
                </div>
              </form>
            )}
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#333'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  itemImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '20px'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  itemName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    flex: 1
  },
  itemPrice: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#4CAF50',
    marginLeft: '12px'
  },
  itemDescription: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5'
  },
  itemMeta: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    cursor: 'default'
  },
  availableBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    cursor: 'pointer'
  },
  unavailableBadge: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    cursor: 'pointer'
  },
  cardActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    flex: 1,
    padding: '10px',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#2196F3',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    border: '2px solid #f44336',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#f44336',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '14px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0'
  },
  tr: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#333'
  },
  tableEditButton: {
    padding: '6px 16px',
    border: '1px solid #2196F3',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#2196F3',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginRight: '8px'
  },
  tableDeleteButton: {
    padding: '6px 16px',
    border: '1px solid #f44336',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#f44336',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  tableCardHeader: {
    marginBottom: '16px'
  },
  tableNumber: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#333'
  },
  tableSlug: {
    fontSize: '13px',
    color: '#999',
    fontFamily: 'monospace'
  },
  qrButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
    maxWidth: '600px',
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
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
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
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
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
    backgroundColor: '#667eea',
    color: 'white',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600'
  }
};

export default AdminPanel;

// frontend/src/pages/MenuManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MenuManager() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ search: '', category: '', availability: '' });
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', categoryId: '', imageUrl: '', availability: true, tags: ''
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', displayOrder: 0, active: true });

  useEffect(() => {
    loadData();
  }, [filter]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.search) params.append('search', filter.search);
      if (filter.category) params.append('category', filter.category);
      if (filter.availability) params.append('availability', filter.availability);

      const [catRes, itemRes] = await Promise.all([
        fetch(`${API_URL}/menu/categories/all`),
        fetch(`${API_URL}/menu/items/search?${params}`)
      ]);

      if (catRes.status === 401 || itemRes.status === 401) {
        navigate('/login');
        return;
      }

      const catData = await catRes.json();
      const itemData = await itemRes.json();

      setCategories(catData.categories || []);
      setMenuItems(itemData.items || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
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
      closeItemModal();
    } catch (error) {
      alert('Failed to save menu item');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `${API_URL}/menu/categories/${editingCategory._id}`
        : `${API_URL}/menu/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryForm)
      });

      if (!response.ok) throw new Error('Failed to save');

      loadData();
      closeCategoryModal();
    } catch (error) {
      alert('Failed to save category');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;

    try {
      const response = await fetch(`${API_URL}/menu/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete');
      loadData();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      const response = await fetch(`${API_URL}/menu/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete');
      }
      loadData();
    } catch (error) {
      alert(error.message);
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

  const openItemModal = (item = null) => {
    setEditingItem(item);
    setItemForm(item ? {
      ...item,
      categoryId: item.categoryId?._id || item.categoryId || '',
      tags: item.tags?.join(', ') || ''
    } : {
      name: '', description: '', price: '', categoryId: '', imageUrl: '', availability: true, tags: ''
    });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    setCategoryForm(category || { name: '', displayOrder: 0, active: true });
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  return (
    <>
      {/* Categories Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📂 Categories ({categories.length})</h2>
          <button style={styles.addButton} onClick={() => openCategoryModal()}>
            + Add Category
          </button>
        </div>

        <div style={styles.categoryGrid}>
          {categories.map(cat => (
            <div key={cat._id} style={styles.categoryCard}>
              <div style={styles.categoryInfo}>
                <h3 style={styles.categoryName}>{cat.name}</h3>
                <span style={styles.categoryOrder}>Order: {cat.displayOrder}</span>
              </div>
              <div style={styles.categoryActions}>
                <span style={{
                  ...styles.badge,
                  ...(cat.active ? styles.activeBadge : styles.inactiveBadge)
                }}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
                <button style={styles.editBtn} onClick={() => openCategoryModal(cat)}>
                  Edit
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDeleteCategory(cat._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📂</span>
            <p>No categories yet</p>
          </div>
        )}
      </div>

      {/* Menu Items Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🍔 Menu Items ({menuItems.length})</h2>
          <button style={styles.addButton} onClick={() => openItemModal()}>
            + Add Item
          </button>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search items..."
            style={styles.searchInput}
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <select
            style={styles.filterSelect}
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select
            style={styles.filterSelect}
            value={filter.availability}
            onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
          >
            <option value="">All Items</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <div style={styles.itemsGrid}>
            {menuItems.map(item => (
              <div key={item._id} style={styles.itemCard}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
                )}
                <div style={styles.itemContent}>
                  <div style={styles.itemHeader}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <span style={styles.itemPrice}>₹{item.price}</span>
                  </div>
                  <p style={styles.itemDescription}>{item.description}</p>
                  <div style={styles.itemMeta}>
                    <span style={styles.badge}>
                      {categories.find(c => c._id === (item.categoryId?._id || item.categoryId || item.category))?.name || 'No Category'}
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
                  {item.tags && item.tags.length > 0 && (
                    <div style={styles.tags}>
                      {item.tags.map((tag, idx) => (
                        <span key={idx} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={styles.itemActions}>
                    <button style={styles.editButton} onClick={() => openItemModal(item)}>
                      Edit
                    </button>
                    <button style={styles.deleteButton} onClick={() => handleDeleteItem(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {menuItems.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '64px' }}>🍽️</span>
            <p>No menu items found</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={styles.modalOverlay} onClick={closeCategoryModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingCategory ? 'Edit' : 'Add'} Category</h2>
              <button style={styles.closeButton} onClick={closeCategoryModal}>✕</button>
            </div>
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
                <button type="button" style={styles.cancelButton} onClick={closeCategoryModal}>Cancel</button>
                <button type="submit" style={styles.saveButton}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div style={styles.modalOverlay} onClick={closeItemModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
              <button style={styles.closeButton} onClick={closeItemModal}>✕</button>
            </div>
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
                <button type="button" style={styles.cancelButton} onClick={closeItemModal}>Cancel</button>
                <button type="submit" style={styles.saveButton}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


const styles = {
  // existing styles...
  
  section: {
    marginBottom: '40px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
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
    fontWeight: '600'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  categoryInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#333'
  },
  categoryOrder: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '600'
  },
  categoryActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1',
    minWidth: '250px',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '180px',
    backgroundColor: 'white'
  },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s'
  },
  itemImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  itemContent: {
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
    lineHeight: '1.5',
    minHeight: '42px'
  },
  itemMeta: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
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
  activeBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    cursor: 'pointer'
  },
  inactiveBadge: {
    backgroundColor: '#ffebee',
    color: '#c62828'
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
  tags: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  tag: {
    fontSize: '11px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px' },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#eee',
    color: '#555',
    cursor: 'default'
  },
  activeBadge: { backgroundColor: '#e0f7e9', color: '#2e7d32' },
  inactiveBadge: { backgroundColor: '#fdecea', color: '#c62828' },
  availableBadge: { backgroundColor: '#e0f7e9', color: '#2e7d32', cursor: 'pointer' },
  unavailableBadge: { backgroundColor: '#fdecea', color: '#c62828', cursor: 'pointer' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  tag: {
    backgroundColor: '#f1f1f1',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    color: '#555'
  },
  itemActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  editButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  editBtn: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  loading: { textAlign: 'center', padding: '30px', fontSize: '18px' },
  emptyState: { textAlign: 'center', padding: '60px', color: '#777' },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#555'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: {
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px'
  },
  formRow: { display: 'flex', gap: '16px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px'
  },
  cancelButton: {
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default MenuManager;

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
    <div style={styles.container}>
      {/* Header */}
      {/* ... (existing JSX content is unchanged) */}
    </div>
  );
}

const styles = {
  // existing styles...
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

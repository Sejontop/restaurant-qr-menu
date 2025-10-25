// frontend/src/pages/Menu.js - SUPER ATTRACTIVE VERSION
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api/menu';


function Menu() {
  const { qrSlug } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, setTable } = useContext(CartContext);
  
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState(null);

  useEffect(() => {
    loadTableInfo();
    loadCategories();
    loadMenuItems();
  }, [qrSlug]);

  useEffect(() => {
    loadMenuItems();
  }, [selectedCategory, searchTerm]);

  useEffect(()=>{
    let tableNumber = qrSlug.split()
  },[])

  const loadTableInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/tables/number/${qrSlug}`);
      const data = await response.json();
      
      console.log('Table info loaded:', data);
      
      if (response.ok && data._id) {
        setTableInfo(data);
        setTable(data);
        // Double-check localStorage
        console.log('Table info saved to localStorage:', localStorage.getItem('tableInfo'));
      } else {
        console.error('Invalid table data received:', data);
      }
    } catch (error) {
      console.error('Error loading table:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/menu/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '50'); // Load more items
      
      const response = await fetch(`${API_URL}/items?${params}`); //not {API_URL}/menu/items cause menu/menu is coming two times
      const data = await response.json();
      console.log(data)
      setItems(data.menu);  //not data.items
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    // Show visual feedback
    const button = document.getElementById(`btn-${item._id}`);
    if (button) {
      button.innerHTML = '✓ Added!';
      button.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        button.innerHTML = '+ Add';
        button.style.backgroundColor = '#ff6b6b';
      }, 1000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Header with gradient */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            🍽️ Delicious Menu
          </h1>
          <p style={styles.heroSubtitle}>
            {tableInfo ? `Table ${tableInfo.number} | ` : ''}Fresh & Tasty
          </p>
        </div>
        
        {/* Floating Cart Button */}
        <button 
          onClick={() => navigate('/cart')}
          style={styles.floatingCart}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <span style={styles.cartIcon}>🛒</span>
          {cart.length > 0 && (
            <span style={styles.cartBadge}>{cart.length}</span>
          )}
        </button>
      </div>

      <div style={styles.content}>
        {/* Search Bar with Icon */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search your favorite dish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Category Pills */}
        <div style={styles.categoriesWrapper}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              ...styles.categoryPill,
              ...(selectedCategory === '' ? styles.categoryPillActive : {})
            }}
          >
            ⭐ All Items
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              style={{
                ...styles.categoryPill,
                ...(selectedCategory === category._id ? styles.categoryPillActive : {})
              }}
            >
              {getCategoryEmoji(category.name)} {category.name}
            </button>
          ))}
        </div>

        {/* Items Count */}
        {!loading && (
          <p style={styles.itemsCount}>
            {items.length} {items.length === 1 ? 'dish' : 'dishes'} available
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading delicious items...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>😕</span>
            <p style={styles.emptyText}>No items found</p>
          </div>
        ) : (
          <div style={styles.menuGrid}>
            {items.map(item => (
              <div 
                key={item._id} 
                style={styles.menuCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                {/* Image Container */}
                <div style={styles.imageContainer}>
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                  {item.tags && item.tags.includes('vegetarian') && (
                    <span style={styles.vegBadge}>🌱</span>
                  )}
                </div>

                {/* Content */}
                <div style={styles.cardContent}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemDescription}>
                    {item.description || 'Delicious and freshly prepared'}
                  </p>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={styles.tagsContainer}>
                      {item.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer with Price and Button */}
                  <div style={styles.cardFooter}>
                    <div style={styles.priceContainer}>
                      <span style={styles.currencySymbol}>₹</span>
                      <span style={styles.price}>{item.price}</span>
                    </div>
                    <button 
                      id={`btn-${item._id}`}
                      onClick={() => handleAddToCart(item)}
                      style={styles.addButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#ff5252';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ff6b6b';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get emoji for categories
function getCategoryEmoji(categoryName) {
  const emojiMap = {
    'pizza': '🍕',
    'burger': '🍔',
    'burgers': '🍔',
    'pasta': '🍝',
    'beverages': '🥤',
    'dessert': '🍰',
    'desserts': '🍰',
    'salad': '🥗',
    'salads': '🥗',
    'chicken': '🍗',
    'soup': '🍲',
    'rice': '🍚',
    'noodles': '🍜',
    'seafood': '🦐',
    'vegetarian': '🥬',
    'starters': '🥟',
    'snacks': '🍿'
  };
  
  const normalized = categoryName.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalized.includes(key)) return emoji;
  }
  return '🍴';
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: '40px'
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center'
  },
  heroTitle: {
    margin: '0 0 12px 0',
    fontSize: '42px',
    color: 'white',
    fontWeight: '800',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
  },
  heroSubtitle: {
    margin: 0,
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400'
  },
  floatingCart: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#ff6b6b',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(255,107,107,0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  cartIcon: {
    fontSize: '32px'
  },
  cartBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#fff',
    color: '#ff6b6b',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 20px'
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '28px'
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '16px 20px 16px 56px',
    borderRadius: '50px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s'
  },
  categoriesWrapper: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
    overflowX: 'auto',
    paddingBottom: '12px',
    scrollbarWidth: 'none'
  },
  categoryPill: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'white',
    borderRadius: '30px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#666'
  },
  categoryPillActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  itemsCount: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    fontWeight: '500'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px'
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
    padding: '80px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px'
  },
  emptyText: {
    color: '#666',
    fontSize: '18px'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s'
  },
  vegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'white',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardContent: {
    padding: '20px'
  },
  itemName: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    lineHeight: '1.3'
  },
  itemDescription: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '42px'
  },
  tagsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  tag: {
    fontSize: '11px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px'
  },
  currencySymbol: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ff6b6b'
  },
  price: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#ff6b6b',
    letterSpacing: '-0.5px'
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '25px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(255,107,107,0.3)'
  }
};

export default Menu;
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedTable = localStorage.getItem('tableInfo');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedTable) {
      setTableInfo(JSON.parse(savedTable));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1, note = '') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.menuItemId === item._id && i.note === note);
      
      if (existingItem) {
        return prevCart.map(i =>
          i.menuItemId === item._id && i.note === note
            ? { ...i, qty: i.qty + quantity }
            : i
        );
      }
      
      return [...prevCart, {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        qty: quantity,
        note
      }];
    });
  };

  const updateQuantity = (menuItemId, note, newQty) => {
    if (newQty <= 0) {
      removeFromCart(menuItemId, note);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.menuItemId === menuItemId && item.note === note
            ? { ...item, qty: newQty }
            : item
        )
      );
    }
  };

  const removeFromCart = (menuItemId, note) => {
    setCart(prevCart =>
      prevCart.filter(item => !(item.menuItemId === menuItemId && item.note === note))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const setTable = (table) => {
    setTableInfo(table);
    localStorage.setItem('tableInfo', JSON.stringify(table));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      tableInfo,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      setTable,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
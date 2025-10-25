// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
// import StaffDashboard from './pages/StaffDashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import MenuManager from './pages/MenuManager';
// import TableManager from './pages/TableManager';

// Protected Route Component (for Staff and Admin only)
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem('token');
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
  
//   if (!token) {
//     return <Navigate to="/login" />;
//   }
  
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/login" />;
//   }
  
//   return children;
// };

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes - No login required for customers */}
            <Route path="/menu/:qrSlug" element={<Menu />} />
            <Route path="/m/:qrSlug" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order/:orderId" element={<OrderStatus />} />
            
            {/* Auth Routes*/}
            {/*<Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> */}
            
            {/* Staff Routes - Login Required */}
            {/* <Route 
              path="/staff" 
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - Login Required */}
           {/* <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/menu" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MenuManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/tables" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TableManager />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
           {/* <Route path="/" element={<Navigate to="/login" />} /> */}
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
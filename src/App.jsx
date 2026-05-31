// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Catalog from './pages/Catalog/Catalog';
import Auth from './pages/Auth/Auth';
import StaffPortal from './pages/StaffPortal/StaffPortal';
import Employees from './pages/Employees/Employees';
import { CartProvider } from './context/CartContext';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('staff_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('staff_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('staff_session');
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <CartProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <Navbar user={user} onLogout={handleLogout} />
          <main style={{ flex: 1, padding: '20px 0' }}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              
              <Route path="/login" element={
                user ? (
                  user.role === 'CLIENTE' ? <Navigate to="/" /> : <Navigate to="/executivo" />
                ) : (
                  <Auth onLogin={handleLogin} />
                )
              } />

              <Route path="/executivo" element={
                user && (user.role === 'ADMINISTRADOR' || user.role === 'FUNCIONARIO') 
                  ? <StaffPortal user={user} /> 
                  : <Navigate to="/login" />
              } />
              
              <Route path="/funcionarios" element={
                user && user.role === 'ADMINISTRADOR' 
                  ? <Employees /> 
                  : <Navigate to="/login" />
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
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

  // Carrega sessão existente se houver
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
  };

  return (
    <BrowserRouter>
      <CartProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <Navbar user={user} onLogout={handleLogout} />
          <main style={{ flex: 1, padding: '20px 0' }}>
            <Routes>
              {/* Rota pública do cardápio */}
              <Route path="/" element={<Catalog />} />
              
              {/* Rota de Login / Cadastro */}
              <Route path="/login" element={
                user ? <Navigate to="/executivo" /> : <Auth onLogin={handleLogin} />
              } />

              {/* Rotas Restritas protegidas por autenticação */}
              <Route path="/executivo" element={
                user ? <StaffPortal user={user} /> : <Navigate to="/login" />
              } />
              
              <Route path="/funcionarios" element={
                user ? <Employees /> : <Navigate to="/login" />
              } />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
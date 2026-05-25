// frontend/src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, BarChart2, Users, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    onLogout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkStyle = (path) => ({
    color: isActive(path) ? 'var(--accent-gold)' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    borderBottom: isActive(path) ? '1px solid var(--accent-gold)' : '1px solid transparent',
  });

  return (
    <nav style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '24px 40px'
    }} className="navbar-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Marca */}
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)', letterSpacing: '0.15em', fontWeight: '600', fontSize: '15px', textTransform: 'uppercase' }}>
          Maison du Burger
        </Link>

        {/* Links Desktop (Ocultado no Celular via CSS abaixo) */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={linkStyle('/')}>
            <ShoppingBag size={14} /> Cardápio
          </Link>

          {user ? (
            <>
              {(user.role === 'FUNCIONARIO' || user.role === 'ADMINISTRADOR') && (
                <>
                  <Link to="/executivo" style={linkStyle('/executivo')}>
                    <BarChart2 size={14} /> Área Executiva
                  </Link>
                  <Link to="/funcionarios" style={linkStyle('/funcionarios')}>
                    <Users size={14} /> Equipe
                  </Link>
                </>
              )}
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={14} /> Sair
              </button>
            </>
          ) : (
            <Link to="/login" style={{ ...linkStyle('/login'), border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-premium)' }}>
              <User size={12} /> Crie sua conta
            </Link>
          )}
        </div>

        {/* Gatilho Hamburger para Telas Pequenas */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          className="nav-mobile-trigger"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Gaveta de Navegação Mobile */}
      {menuOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          marginTop: '16px'
        }}>
          <Link to="/" style={linkStyle('/')} onClick={() => setMenuOpen(false)}>
            <ShoppingBag size={14} /> Cardápio
          </Link>
          {user ? (
            <>
              {(user.role === 'FUNCIONARIO' || user.role === 'ADMINISTRADOR') && (
                <>
                  <Link to="/executivo" style={linkStyle('/executivo')} onClick={() => setMenuOpen(false)}>
                    <BarChart2 size={14} /> Área Executiva
                  </Link>
                  <Link to="/funcionarios" style={linkStyle('/funcionarios')} onClick={() => setMenuOpen(false)}>
                    <Users size={14} /> Equipe
                  </Link>
                </>
              )}
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <LogOut size={14} /> Sair
              </button>
            </>
          ) : (
            <Link to="/login" style={linkStyle('/login')} onClick={() => setMenuOpen(false)}>
              <User size={12} /> Crie sua conta
            </Link>
          )}
        </div>
      )}

      {/* Regra de Ocultação/Exibição Dinâmica */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-trigger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
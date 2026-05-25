import React from 'react';
import { Plus, Clock, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onAdd }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-premium)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      boxShadow: 'var(--shadow-premium)'
    }} className="transition-premium">
      
      {/* Badge Flutuante de Categoria/Status */}
      {product.badge && (
        <span style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(158, 128, 82, 0.08)',
          color: 'var(--accent-gold)',
          padding: '4px 10px',
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 5
        }}>
          <Sparkles size={8} /> {product.badge}
        </span>
      )}

      <div>
        {/* Espaço de imagem ou ilustrador minimalista */}
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-premium)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '600' }}>
                Maison
              </span>
            </div>
          )}

          {/* Tempo de Preparo Estimado */}
          {product.prep_time && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(26, 26, 24, 0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontWeight: '500'
            }}>
              <Clock size={10} /> {product.prep_time}
            </div>
          )}
        </div>

        {/* Título */}
        <h3 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          fontWeight: '400',
          letterSpacing: '0.02em',
          marginBottom: '10px',
          color: 'var(--text-primary)'
        }}>{product.name}</h3>

        {/* Descrição dos Ingredientes */}
        <p style={{
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          marginBottom: '28px',
          minHeight: '64px'
        }}>{product.description}</p>
      </div>

      {/* Preço e Botão de Adição */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px'
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em'
        }}>
          R$ {Number(product.price).toFixed(2)}
        </span>
        
        <button
          onClick={() => onAdd(product)}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--text-primary)',
            borderRadius: 'var(--radius-premium)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="transition-premium"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--text-primary)';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'var(--text-primary)';
          }}
        >
          <Plus size={12} /> Selecionar
        </button>
      </div>
    </div>
  );
}
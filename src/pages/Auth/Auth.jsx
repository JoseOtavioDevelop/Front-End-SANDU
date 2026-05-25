// frontend/src/pages/Auth/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import { LogIn, UserPlus, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Preencha os campos obrigatórios.');

    let assignedRole = 'CLIENTE';

    // Regra do Desenvolvedor: Identifica contas administrativas
    if (email.toLowerCase() === 'admin@maison.com' && password === 'admin123') {
      assignedRole = 'ADMINISTRADOR';
    } else if (email.toLowerCase().endsWith('@maison.com')) {
      // Reconhece e-mails corporativos criados pelo adm como funcionários
      assignedRole = 'FUNCIONARIO';
    }

    onLogin({
      name: isLoginTab ? email.split('@')[0] : name,
      email,
      role: assignedRole
    });

    // Se for cliente, retorna ao cardápio. Se for equipe, vai para o painel executivo.
    if (assignedRole === 'CLIENTE') {
      navigate('/');
    } else {
      navigate('/executivo');
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '14px',
    backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--accent-gold)' : '2px solid transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-premium)',
        padding: '40px',
        boxShadow: 'var(--shadow-premium)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={10} /> Maison de Confiance
          </span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', marginTop: '12px', color: 'var(--text-primary)' }}>
            {isLoginTab ? 'Acesso ao Espaço' : 'Criar Conta de Cliente'}
          </h2>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
          <button style={tabStyle(isLoginTab)} onClick={() => setIsLoginTab(true)}>Entrar</button>
          <button style={tabStyle(!isLoginTab)} onClick={() => setIsLoginTab(false)}>Cadastrar</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLoginTab && (
            <Input label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Alexandre" required />
          )}

          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: nome@exemplo.com" required />

          <div style={{ position: 'relative' }}>
            <Input label="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" style={{
            width: '100%',
            backgroundColor: 'var(--text-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-premium)',
            padding: '14px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }} className="transition-premium">
            {isLoginTab ? <LogIn size={14} /> : <UserPlus size={14} />} {isLoginTab ? 'Entrar' : 'Confirmar Cadastro'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '32px', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deseja apenas ver o cardápio?</p>
          <button 
            onClick={() => navigate('/')} 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px'
            }}
          >
            Navegar como Visitante <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
}
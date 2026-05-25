// frontend/src/pages/Employees/Employees.jsx
import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { getEmployees, createEmployee } from '../../services/employeeService';
import Input from '../../components/Input/Input';
import { User, PhoneCall, Briefcase, Mail, Key } from 'lucide-react';

export default function Employees() {
  const { data: employees, loading, refetch } = useFetch(getEmployees);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !role || !email || !password) return alert('Por favor, preencha todos os campos obrigatórios.');

    try {
      await createEmployee({ 
        name, 
        role, 
        phone, 
        email, 
        password,
        roleType: 'FUNCIONARIO'
      });

      setName('');
      setRole('');
      setPhone('');
      setEmail('');
      setPassword('');
      refetch();
      alert('Credencial de colaborador criada com sucesso.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px' }}>
        Equipe do Atelier
      </h2>

      {/* Uso da classe backoffice-grid (eliminando conflitos de style inline) */}
      <div className="backoffice-grid">
        
        {/* Adicionar Colaborador */}
        <div style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-premium)', 
          padding: '32px', 
          height: 'fit-content',
          boxShadow: 'var(--shadow-premium)'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Criar Acesso de Colaborador
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Nome do Funcionário" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Jean-Luc" required />
            <Input label="Atribuição / Cargo" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Chef de Partie" required />
            <Input label="Contato Telefônico" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (11) 99999-9999" />
            
            <div style={{ 
              borderTop: '1px solid var(--border-color)', 
              margin: '8px 0 0 0', 
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '600', display: 'block' }}>
                Credenciais de Acesso
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  E-mail Corporativo
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@maison.com"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 36px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Senha Provisória
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={14} style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 36px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" style={{
              width: '100%',
              backgroundColor: 'var(--text-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-premium)',
              padding: '12px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: '12px'
            }} className="transition-premium">
              Emitir Acesso
            </button>
          </form>
        </div>

        {/* Lista de Colaboradores */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>Membros Registrados</h3>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Buscando cadastro de pessoal...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {(employees || []).map((emp) => (
                <div key={emp.id} style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-premium)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-premium)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                      <User size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }}>{emp.name}</h4>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Briefcase size={10} /> {emp.role}
                      </span>
                    </div>
                  </div>
                  {(emp.phone || emp.email) && (
                    <div style={{ borderTop: '1px solid var(--bg-primary)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {emp.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PhoneCall size={12} /> {emp.phone}</span>}
                      {emp.email && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} /> {emp.email}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
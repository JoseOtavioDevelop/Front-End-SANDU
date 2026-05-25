import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { getTransactions, addTransaction } from '../../services/cashService';
import Input from '../../components/Input/Input';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function CashRegister() {
  const { data: transactions, loading, refetch } = useFetch(getTransactions);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ENTRADA');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;

    try {
      await addTransaction({ description: desc, amount: parseFloat(amount), type });
      setDesc('');
      setAmount('');
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '32px' }}>
        Lançamentos de Caixa
      </h2>

      {/* Formulário de Lançamento */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px', marginBottom: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'end' }}>
          <Input label="Descrição do Item" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex: Aquisição de Insumos" required />
          <Input label="Valor Monetário (R$)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{
              padding: '11px',
              borderRadius: 'var(--radius-premium)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              fontSize: '13px',
              outline: 'none',
              color: 'var(--text-primary)'
            }}>
              <option value="ENTRADA">Recebimento (Entrada)</option>
              <option value="SAIDA">Desembolso (Saída)</option>
            </select>
          </div>

          <button type="submit" style={{
            height: '42px',
            backgroundColor: 'var(--text-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-premium)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }} className="transition-premium">
            Confirmar Registro
          </button>
        </form>
      </div>

      {/* Histórico Limpo */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Atividades Recentes</h3>
          <button onClick={refetch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Carregando dados...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions?.map((t) => (
              <div key={t.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid var(--bg-primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {t.type === 'ENTRADA' ? (
                    <ArrowUpRight size={18} strokeWidth={1.5} style={{ color: 'var(--accent-gold)' }} />
                  ) : (
                    <ArrowDownRight size={18} strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                  )}
                  <div>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>{t.description}</span>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: t.type === 'ENTRADA' ? 'var(--accent-gold)' : 'var(--text-primary)'
                }}>
                  {t.type === 'ENTRADA' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
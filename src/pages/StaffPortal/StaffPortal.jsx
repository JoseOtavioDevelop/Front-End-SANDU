// frontend/src/pages/StaffPortal/StaffPortal.jsx
import React, { useState, useMemo } from 'react';
import useFetch from '../../hooks/useFetch';
import { getDashboardMetrics } from '../../services/dashboardService';
import { getTransactions, addTransaction } from '../../services/cashService';
import { createProduct } from '../../services/productService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Input from '../../components/Input/Input';
import { 
  BarChart2, DollarSign, FileText, ArrowUpRight, ArrowDownRight, 
  RefreshCw, Sparkles, Download, Clock, Percent, Award, Filter, Search, Wallet, ChefHat, Edit2, Trash2, Plus 
} from 'lucide-react';

const INITIAL_PRODUCTS_MOCKS = [
  {
    id: 'mock-1',
    name: 'L’Original Gruyère',
    description: 'Blend Angus grelhado na brasa, generosa camada de queijo Gruyère suíço derretido, cebolas caramelizadas lentamente no Vinho do Porto e maionese trufada no pão brioche tostado na manteiga de ervas.',
    price: 46.00,
    category: 'burgers',
    badge: 'Assinatura',
    prep_time: '15 min',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-2',
    name: 'Le Truffé Sauvage',
    description: 'Blend nobre de costela e fraldinha Angus, queijo Brie derretido, mix de cogumelos Paris e Shimeji salteados na manteiga noisette com raspas de limão siciliano e azeite de trufas brancas.',
    price: 52.00,
    category: 'burgers',
    badge: 'Sazonal',
    prep_time: '18 min',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-4',
    name: 'Frites Aromatiques de la Maison',
    description: 'Batatas rústicas cortadas manualmente, fritas em dupla cocção para máxima crocância, finalizadas com alecrim fresco tostado, flor de sal Maldon e servidas com maionese de alho negro.',
    price: 24.00,
    category: 'acompanhamentos',
    badge: 'Clássico',
    prep_time: '10 min',
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80'
  }
];

const FALLBACK_METRICS = {
  overview: { totalIn: 32450.00, totalOut: 9800.00 },
  peakHours: [
    { hour: '17:00', total: 1200 },
    { hour: '18:00', total: 3400 },
    { hour: '19:00', total: 6800 },
    { hour: '20:00', total: 8900 },
    { hour: '21:00', total: 7200 },
    { hour: '22:00', total: 3800 },
    { hour: '23:00', total: 1150 }
  ],
  paymentMethods: [
    { method: 'PIX', value: 14602.50, percent: 45 },
    { method: 'Crédito', value: 9735.00, percent: 30 },
    { method: 'Débito', value: 4867.50, percent: 15 },
    { method: 'Dinheiro', value: 3245.00, percent: 10 }
  ],
  topProducts: [
    { name: 'L’Original Gruyère', qty: 248, total: 11408 },
    { name: 'Frites de la Maison', qty: 184, total: 4416 },
    { name: 'Le Truffé Sauvage', qty: 112, total: 5824 }
  ],
  staffPerformance: [
    { name: 'Jean-Luc (Cuisine)', salesCount: 210, revenue: 9660 },
    { name: 'Claire (Salão)', salesCount: 168, revenue: 7728 }
  ]
};

const INITIAL_CASH_LOGS = [
  { id: 't1', description: 'Venda Mesa 04 - L’Original Gruyère', amount: 92.00, type: 'ENTRADA', method: 'PIX', date: new Date() },
  { id: 't2', description: 'Aquisição de Embalagens Kraft', amount: 350.00, type: 'SAIDA', method: 'Dinheiro', date: new Date() },
  { id: 't3', description: 'Venda Mesa 08 - Combo Le Truffé', amount: 128.00, type: 'ENTRADA', method: 'Cartão de Crédito', date: new Date() }
];

export default function StaffPortal({ user }) {
  const [activeTab, setActiveTab] = useState('metrics');
  const { data: dbMetrics, loading: loadingMetrics } = useFetch(getDashboardMetrics);
  const { data: dbTransactions, loading: loadingCash, refetch: refetchCash } = useFetch(getTransactions);

  const [productsList, setProductsList] = useState(INITIAL_PRODUCTS_MOCKS || []);
  const [editingProduct, setEditingProduct] = useState(null);

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ENTRADA');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('TODOS');

  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCat, setProdCat] = useState('burgers');
  const [prodBadge, setProdBadge] = useState('');
  const [prodPrep, setProdPrep] = useState('');
  const [prodImg, setProdImg] = useState('');

  const [reportType, setReportType] = useState('MENSAL');
  const [generating, setGenerating] = useState(false);

  const metrics = (dbMetrics && dbMetrics.weekly && dbMetrics.weekly.length > 0) ? dbMetrics : FALLBACK_METRICS;
  const currentTransactions = (dbTransactions && dbTransactions.length > 0) ? dbTransactions : (INITIAL_CASH_LOGS || []);

  const totalIn = currentTransactions.filter(t => t.type === 'ENTRADA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOut = currentTransactions.filter(t => t.type === 'SAIDA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIn - totalOut;
  const lucrativeratio = totalIn > 0 ? ((balance / totalIn) * 100).toFixed(0) : 0;

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const chartData = metrics?.weekly?.map((item) => ({
    dia: weekDays[item.day - 1] || 'Outro',
    Valor: Number(item.total)
  })) || [];

  const methodBalances = useMemo(() => {
    const balances = { PIX: 0, Dinheiro: 0, 'Cartão de Crédito': 0, 'Cartão de Débito': 0, Outros: 0 };
    (currentTransactions || []).forEach(t => {
      const amt = Number(t.amount);
      const m = t.method || 'Outros';
      if (t.type === 'ENTRADA') {
        balances[m] = (balances[m] || 0) + amt;
      } else {
        balances[m] = (balances[m] || 0) - amt;
      }
    });
    return balances;
  }, [currentTransactions]);

  const filteredTransactions = useMemo(() => {
    return (currentTransactions || []).filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMethod = filterMethod === 'TODOS' || t.method === filterMethod;
      return matchSearch && matchMethod;
    });
  }, [currentTransactions, searchTerm, filterMethod]);

  const handleAddCash = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;
    try {
      await addTransaction({ description: desc, amount: parseFloat(amount), type, method: paymentMethod });
      setDesc('');
      setAmount('');
      refetchCash();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return alert('Por favor, defina o nome e valor do produto.');

    const newProductData = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      category: prodCat,
      badge: prodBadge,
      prep_time: prodPrep,
      image_url: prodImg || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
    };

    try {
      if (editingProduct) {
        setProductsList(prev => (prev || []).map(p => p.id === editingProduct.id ? { ...p, ...newProductData } : p));
        setEditingProduct(null);
        alert('Produto atualizado.');
      } else {
        const generatedId = 'added-' + Date.now();
        const created = { id: generatedId, ...newProductData };
        setProductsList(prev => [created, ...(prev || [])]);
        alert('Novo produto integrado com sucesso.');
      }

      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdCat('burgers');
      setProdBadge('');
      setProdPrep('');
      setProdImg('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(product.price.toString());
    setProdCat(product.category || 'burgers');
    setProdBadge(product.badge || '');
    setProdPrep(product.prep_time || '');
    setProdImg(product.image_url || '');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdCat('burgers');
    setProdBadge('');
    setProdPrep('');
    setProdImg('');
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Excluir este item?')) {
      setProductsList(prev => (prev || []).filter(p => p.id !== productId));
    }
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`Relatório processado.`);
    }, 1500);
  };

  const navTabStyle = (tabId) => ({
    padding: '12px 20px',
    backgroundColor: activeTab === tabId ? 'var(--bg-surface)' : 'transparent',
    border: '1px solid ' + (activeTab === tabId ? 'var(--border-color)' : 'transparent'),
    borderBottom: activeTab === tabId ? '1px solid transparent' : '1px solid var(--border-color)',
    borderRadius: 'var(--radius-premium) var(--radius-premium) 0 0',
    color: activeTab === tabId ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer'
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '600' }}>Diretório Administrativo</span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', marginTop: '8px', color: 'var(--text-primary)' }}>
            Olá, {user.name}
          </h2>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Perfil: {user.role}
        </span>
      </div>

      {/* Abas com suporte a deslizar no Mobile (Sem quebrar linhas) */}
      <div className="scrollable-tabs-container">
        <button style={navTabStyle('metrics')} onClick={() => setActiveTab('metrics')}>
          <BarChart2 size={12} style={{ marginRight: '6px' }} /> Métricas & Desempenho
        </button>
        <button style={navTabStyle('cash')} onClick={() => setActiveTab('cash')}>
          <Wallet size={12} style={{ marginRight: '6px' }} /> Fluxo de Caixa Reconciliado
        </button>
        <button style={navTabStyle('menu')} onClick={() => setActiveTab('menu')}>
          <ChefHat size={12} style={{ marginRight: '6px' }} /> Gestão de Cardápio
        </button>
        <button style={navTabStyle('reports')} onClick={() => setActiveTab('reports')}>
          <FileText size={12} style={{ marginRight: '6px' }} /> Relatórios & Auditoria
        </button>
      </div>

      {/* TAB: MÉTRICAS */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Métricas principais */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entradas de Vendas</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '400' }}>R$ {totalIn.toFixed(2)}</h3>
              </div>
              <ArrowUpRight size={22} color="var(--accent-gold)" />
            </div>
            <div style={{ flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saídas de Caixa</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '400' }}>R$ {totalOut.toFixed(2)}</h3>
              </div>
              <ArrowDownRight size={22} color="var(--text-secondary)" />
            </div>
            <div style={{ flex: 1, minWidth: '240px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margem de Lucro</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '400', color: 'var(--accent-gold)' }}>{lucrativeratio}%</h3>
              </div>
              <Sparkles size={18} color="var(--accent-gold)" />
            </div>
          </div>

          {/* Gráfico Sem Grade Inline Fixa */}
          <div className="backoffice-grid">
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '24px' }}>Comportamento Horário (Pico de Vendas)</h4>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={(FALLBACK_METRICS.peakHours || [])}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" vertical={false} />
                    <XAxis dataKey="hour" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-premium)', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="total" stroke="var(--accent-gold)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '24px' }}>Métodos de Pagamento</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(FALLBACK_METRICS.paymentMethods || []).map((pm) => (
                    <div key={pm.method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        <span>{pm.method}</span>
                        <span style={{ fontWeight: '500' }}>R$ {pm.value.toFixed(2)} ({pm.percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px' }}>
                        <div style={{ width: `${pm.percent}%`, height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONTROLE DE CAIXA */}
      {activeTab === 'cash' && (
        <div className="backoffice-grid">
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px', height: 'fit-content' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>Novo Movimento</h4>
            <form onSubmit={handleAddCash} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex: Reposição de Insumos" required />
              <Input label="Valor (R$)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Movimentação</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '11px', borderRadius: 'var(--radius-premium)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '13px' }}>
                  <option value="ENTRADA">Entrada (Venda / Aporte)</option>
                  <option value="SAIDA">Saída (Despesa / Retirada)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Canal de Liquidação</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: '11px', borderRadius: 'var(--radius-premium)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '13px' }}>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: 'var(--text-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-premium)', padding: '12px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Registrar Movimento
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '24px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '16px' }}>Saldos Reconciliados</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                {Object.entries(methodBalances || {}).map(([method, val]) => (
                  <div key={method} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', backgroundColor: 'var(--bg-primary)' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{method}</span>
                    <strong style={{ fontSize: '14px', display: 'block', marginTop: '6px' }}>R$ {val.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Histórico</h4>
                <button onClick={refetchCash} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><RefreshCw size={14} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(filteredTransactions || []).map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--bg-primary)' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{t.description}</span>
                      <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>{t.method} • {new Date(t.date).toLocaleDateString('pt-BR')}</small>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: t.type === 'ENTRADA' ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                      {t.type === 'ENTRADA' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GESTÃO DE CARDÁPIO */}
      {activeTab === 'menu' && (
        <div className="backoffice-grid">
          
          {/* Formulário de Adicionar / Editar */}
          <div style={{ 
            backgroundColor: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-premium)', 
            padding: '32px', 
            height: 'fit-content',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={14} /> {editingProduct ? 'Modificar Item de Menu' : 'Adicionar Prato de Menu'}
            </h4>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Título do Prato" value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Ex: L’Original Truffé" required />
              <Input label="Ingredientes" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Ex: Blend Angus, Brie..." />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid-responsive">
                <Input label="Valor (R$)" type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="0.00" required />
                <Input label="Tempo de Preparo" value={prodPrep} onChange={(e) => setProdPrep(e.target.value)} placeholder="Ex: 15 min" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid-responsive">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria</label>
                  <select value={prodCat} onChange={(e) => setProdCat(e.target.value)} style={{ padding: '11px', borderRadius: 'var(--radius-premium)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="burgers">Hambúrgueres</option>
                    <option value="acompanhamentos">Entradas / Acompanhamentos</option>
                    <option value="bebidas">Bebidas Finas</option>
                  </select>
                </div>
                <Input label="Selo Especial" value={prodBadge} onChange={(e) => setProdBadge(e.target.value)} placeholder="Ex: Chef Choice" />
              </div>

              <Input label="Link da Imagem Unsplash" value={prodImg} onChange={(e) => setProdImg(e.target.value)} placeholder="https://..." />

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" style={{ flex: 2, backgroundColor: 'var(--text-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-premium)', padding: '12px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }} className="transition-premium">
                  {editingProduct ? 'Gravar Alterações' : 'Criar Novo Prato'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={handleCancelEdit} style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '12px', fontSize: '11px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }} className="transition-premium">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Listagem para Edição / Exclusão */}
          <div style={{ 
            backgroundColor: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-premium)', 
            padding: '32px',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
              Seleção do Cardápio Ativo ({(productsList || []).length} itens)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '580px', overflowY: 'auto', paddingRight: '4px' }}>
              {(productsList || []).map((product) => (
                <div key={product.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-premium)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '4px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-primary)' }}>{product.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {product.category} • R$ {Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleStartEdit(product)} 
                      title="Editar Item"
                      style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      className="transition-premium"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)} 
                      title="Excluir Item"
                      style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#c62828', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      className="transition-premium"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB: RELATÓRIOS */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '40px', maxWidth: '640px', margin: '0 auto', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <FileText size={32} style={{ color: 'var(--accent-gold)', marginBottom: '16px' }} />
            <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', color: 'var(--text-primary)' }}>Geração de Balancetes e Fechamentos</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Auditoria consolidada do caixa, vendas por hora e performance de equipe em arquivo fechado.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Periodicidade Fiscal</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ padding: '11px', borderRadius: 'var(--radius-premium)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontSize: '13px' }}>
                <option value="SEMANAL">Relatório Consolidado Semanal (Demonstrativo corrente)</option>
                <option value="MENSAL">Balanço Contábil Mensal (DRE e Balancete do caixa)</option>
                <option value="ANUAL">Relatório Tributário Anual (Prestação de contas do exercício)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerateReport} 
            disabled={generating}
            style={{
              width: '100%',
              backgroundColor: 'var(--text-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-premium)',
              padding: '14px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            className="transition-premium"
          >
            <Download size={14} /> {generating ? 'Processando balancete...' : 'Gerar e Exportar em PDF'}
          </button>
        </div>
      )}

    </div>
  );
}
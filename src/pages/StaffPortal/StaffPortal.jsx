// frontend/src/pages/StaffPortal/StaffPortal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { getDashboardMetrics } from '../../services/dashboardService';
import { getTransactions, addTransaction } from '../../services/cashService';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService'; // CRUD completo de produtos
import { getOrders, approveOrder, cancelOrder } from '../../services/orderService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Input from '../../components/Input/Input';
import { 
  BarChart2, DollarSign, FileText, ArrowUpRight, ArrowDownRight, 
  RefreshCw, Sparkles, Download, Clock, Percent, Award, Filter, Search, Wallet, ChefHat, Edit2, Trash2, Plus, Inbox, Check, X, Upload, Image 
} from 'lucide-react';

const INITIAL_PRODUCTS_MOCKS = [
  { id: 'mock-1', name: 'L’Original Gruyère', description: 'Blend Angus grelhado na brasa, queijo Gruyère, cebolas caramelizadas.', price: 46.00, category: 'burgers', badge: 'Assinatura', prep_time: '15 min', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' }
];

const FALLBACK_METRICS = {
  overview: { totalIn: 0.00, totalOut: 0.00 },
  peakHours: [
    { hour: '17:00', total: 0 }, { hour: '18:00', total: 0 }, { hour: '19:00', total: 0 },
    { hour: '20:00', total: 0 }, { hour: '21:00', total: 0 }, { hour: '22:00', total: 0 }, { hour: '23:00', total: 0 }
  ],
  paymentMethods: [
    { method: 'PIX', value: 0.00, percent: 0 }, { method: 'Cartão de Crédito', value: 0.00, percent: 0 },
    { method: 'Cartão de Débito', value: 0.00, percent: 0 }, { method: 'Dinheiro', value: 0.00, percent: 0 }
  ]
};

const INITIAL_CASH_LOGS = [
  { id: 't1', description: 'Venda Mesa 04 - L’Original Gruyère', amount: 92.00, type: 'ENTRADA', method: 'PIX', date: new Date() }
];

export default function StaffPortal({ user }) {
  // Inicialização de Aba Dinâmica para Funcionários
  const [activeTab, setActiveTab] = useState(user?.role === 'FUNCIONARIO' ? 'orders' : 'metrics');
  
  const { data: dbMetrics } = useFetch(getDashboardMetrics);
  const { data: dbTransactions, refetch: refetchCash } = useFetch(getTransactions);

  // Estados locais de produtos e pedidos
  const [productsList, setProductsList] = useState(INITIAL_PRODUCTS_MOCKS || []);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form de Caixa
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ENTRADA');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  // Filtros de Caixa
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('TODOS');

  // Form de Produtos
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCat, setProdCat] = useState('burgers');
  const [prodBadge, setProdBadge] = useState('');
  const [prodPrep, setProdPrep] = useState('');
  const [prodImg, setProdImg] = useState('');

  // Form de Relatório
  const [reportType, setReportType] = useState('MENSAL');
  const [generating, setGenerating] = useState(false);

  const fetchPendingOrders = () => {
    setLoadingOrders(true);
    getOrders()
      .then(res => setOrders(res.data || []))
      .catch(() => console.log('Aguardando lançamentos no banco de dados.'))
      .finally(() => setLoadingOrders(false));
  };

  const fetchProductsFromDatabase = () => {
    getProducts()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProductsList(res.data);
        }
      })
      .catch((err) => console.error('Erro ao buscar produtos, mantendo mocks locais.', err));
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchProductsFromDatabase();
  }, [activeTab]);

  const handleApproveOrder = async (id) => {
    try {
      await approveOrder(id);
      alert(`Pedido #${id} homologado com sucesso.`);
      fetchPendingOrders();
      if (refetchCash) refetchCash();
    } catch (err) {
      alert('Erro ao homologar pedido.');
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Confirmar cancelamento deste pedido no Atelier?')) {
      try {
        await cancelOrder(id);
        alert(`Pedido #${id} cancelado.`);
        fetchPendingOrders();
      } catch (err) {
        alert('Erro ao cancelar pedido.');
      }
    }
  };

  const currentTransactions = (dbTransactions && dbTransactions.length > 0) ? dbTransactions : INITIAL_CASH_LOGS;

  const totalIn = currentTransactions.filter(t => t.type === 'ENTRADA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOut = currentTransactions.filter(t => t.type === 'SAIDA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIn - totalOut;
  const lucrativeratio = totalIn > 0 ? ((balance / totalIn) * 100).toFixed(0) : 0;

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Lógica de Renderização que prioriza o banco de dados em tempo real
  const data = dbMetrics ? dbMetrics : FALLBACK_METRICS;

  // 🔥 CORREÇÃO DE REFERÊNCIA: Alinhado para ler 'data?.weekly' em vez de 'metrics'
  const chartData = data?.weekly?.map((item) => ({
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

  // Carrega e Converte a Imagem do Dispositivo do Administrador para Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('Por favor, selecione uma imagem de até 1.5MB para manter o carregamento fluido.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProdImg(reader.result); // Define a string Base64 do arquivo carregado
    };
    reader.readAsDataURL(file);
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
        await updateProduct(editingProduct.id, newProductData);
        alert('Produto atualizado com sucesso no banco de dados!');
      } else {
        await createProduct(newProductData);
        alert('Novo produto integrado com sucesso ao banco de dados!');
      }
      handleCancelEdit();
      fetchProductsFromDatabase();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar os dados do produto.');
    }
  };

  const handleStartEdit = (product) => {
    if (!product) return;
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(product.price !== undefined && product.price !== null ? product.price.toString() : '');
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Excluir este item de forma permanente do cardápio?')) {
      try {
        await deleteProduct(productId);
        alert('Produto removido de forma definitiva!');
        fetchProductsFromDatabase();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir o produto do servidor.');
      }
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

      {/* Abas */}
      <div className="scrollable-tabs-container">
        {user?.role === 'ADMINISTRADOR' && (
          <button style={navTabStyle('metrics')} onClick={() => setActiveTab('metrics')}>
            <BarChart2 size={12} style={{ marginRight: '6px' }} /> Métricas & Desempenho
          </button>
        )}
        
        <button style={navTabStyle('orders')} onClick={() => setActiveTab('orders')}>
          <Inbox size={12} style={{ marginRight: '6px' }} /> Painel de Pedidos
        </button>
        
        <button style={navTabStyle('cash')} onClick={() => setActiveTab('cash')}>
          <Wallet size={12} style={{ marginRight: '6px' }} /> Fluxo de Caixa Reconciliado
        </button>
        
        <button style={navTabStyle('menu')} onClick={() => setActiveTab('menu')}>
          <ChefHat size={12} style={{ marginRight: '6px' }} /> Gestão de Cardápio
        </button>

        {user?.role === 'ADMINISTRADOR' && (
          <button style={navTabStyle('reports')} onClick={() => setActiveTab('reports')}>
            <FileText size={12} style={{ marginRight: '6px' }} /> Relatórios & Auditoria
          </button>
        )}
      </div>

      {/* TAB: MÉTRICAS */}
      {activeTab === 'metrics' && user?.role === 'ADMINISTRADOR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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

          <div className="backoffice-grid">
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '24px' }}>Comportamento Horário (Pico de Vendas)</h4>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={(data?.peakHours || [])}>
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
                  {(data?.paymentMethods || []).map((pm) => (
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

      {/* TAB: PAINEL DE PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="backoffice-grid">
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fila de Pedidos Pendentes</h4>
              <button onClick={fetchPendingOrders} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <RefreshCw size={14} />
              </button>
            </div>

            {loadingOrders ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Aguardando conexão...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                {(orders || []).map((order) => (
                  <div key={order.id} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-premium)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${order.status === 'PENDENTE' ? 'var(--accent-gold)' : order.status === 'PAGO' ? 'green' : 'var(--text-secondary)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '14px' }}>Pedido #{order.id} — {order.customer_name}</strong>
                      <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', color: order.status === 'PENDENTE' ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {order.status}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>📍 {order.address}</p>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Método: {order.payment_method}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>R$ {Number(order.total).toFixed(2)}</strong>
                    </div>

                    {order.status === 'PENDENTE' && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button 
                          onClick={() => handleApproveOrder(order.id)}
                          style={{ flex: 1, backgroundColor: 'var(--text-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-premium)', padding: '8px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Check size={12} /> Homologar Pago
                        </button>
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          style={{ backgroundColor: 'transparent', color: '#c62828', border: '1px solid #c62828', borderRadius: 'var(--radius-premium)', padding: '8px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {(orders || []).length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Sem pedidos no histórico recente.</p>
                )}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-premium)', padding: '32px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>Instruções de Conciliação</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineheight: '1.6', marginBottom: '16px' }}>
                Os pedidos enviados pelos clientes chegam neste painel com status <strong>PENDENTE</strong>. Eles não constam no faturamento do caixa ainda.
              </p>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', lineheight: '1.8' }}>
                <li>Confirme a chegada da mensagem de solicitação no WhatsApp.</li>
                <li>Verifique se o pagamento (PIX ou Cartão) de fato ocorreu.</li>
                <li>Clique em <strong>"Homologar Pago"</strong> para autorizar a entrada do valor no fluxo financeiro da semana.</li>
              </ul>
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

              {/* Imagem em Base64 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Imagem do Prato (Carregar foto ou link)
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-premium)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }} className="transition-premium">
                    <Upload size={13} /> Carregar Foto do Dispositivo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  
                  {prodImg && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Image size={12} /> Foto anexada com sucesso
                    </span>
                  )}
                </div>
              </div>

              <Input label="Ou cole o Link de imagem da internet (URL)" value={prodImg} onChange={(e) => setProdImg(e.target.value)} placeholder="https://..." />

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

          <div className="backoffice-card">
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
              Seleção do Cardápio Ativo ({(productsList || []).length} itens)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '580px', overflowY: 'auto', paddingRight: '4px' }}>
              {(productsList || []).map((product) => (
                <div key={product.id} className="backoffice-item-card">
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

                  <div className="backoffice-item-card-actions">
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
      {activeTab === 'reports' && user?.role === 'ADMINISTRADOR' && (
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
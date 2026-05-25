// frontend/src/pages/Catalog/Catalog.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/Card/ProductCard';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';
import { ShoppingBag, Send, MapPin, User, CreditCard, Sparkles, Compass } from 'lucide-react';

// Cardápio completo com 12 pratos e fotografias de alto padrão gastronômico
const PREMIUM_MENU_MOCKS = [
  // --- 6 Pratos Originais ---
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
    id: 'mock-3',
    name: 'Le Poulet de Provence',
    description: 'Filé de frango marinado em ervas finas de Provence grelhado, queijo de cabra suave cremoso, rúcula selvagem fresca, tomates confitados e molho Dijonnaise artesanal no pão australiano selado.',
    price: 39.00,
    category: 'burgers',
    badge: 'Chef Choice',
    prep_time: '12 min',
    image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80'
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
  },
  {
    id: 'mock-5',
    name: 'Croquetes de Costela Trufados',
    description: 'Quatro unidades de croquetes cremosos de costela bovina desfiada cozida lentamente por 12 horas, empanados em farinha panko crocante, servidos com geléia de pimenta defumada de fabricação própria.',
    price: 28.00,
    category: 'acompanhamentos',
    badge: 'Para Compartilhar',
    prep_time: '14 min',
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-6',
    name: 'Nectar de Frutas Vermelhas e Hibisco',
    description: 'Infusão gelada de hibisco orgânico com calda artesanal de framboesa, amora e mirtilo frescos, finalizado com água tônica premium e fatias finas de limão siciliano.',
    price: 16.00,
    category: 'bebidas',
    badge: 'Sem Álcool',
    prep_time: '5 min',
    image_url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80'
  },
  // --- 6 Novos Pratos de Luxo ---
  {
    id: 'mock-7',
    name: 'Le Bacon Fumé au Bourbon',
    description: 'Blend Angus 150g, generosas fatias de queijo Cheddar inglês maturado derretido, tiras crocantes de bacon glaceado em xarope de bordo orgânico e redução artesanal de barbecue ao uísque Bourbon.',
    price: 48.00,
    category: 'burgers',
    badge: 'Destaque',
    prep_time: '16 min',
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-8',
    name: 'L’Atelier Végétarien',
    description: 'Medalhão artesanal de grão-de-bico tostado com sementes de girassol, queijo de coalho selado na chapa, abobrinha e berinjela grelhadas ao azeite de ervas finas e pesto fresco de manjericão genovês.',
    price: 38.00,
    category: 'burgers',
    badge: 'Veggie',
    prep_time: '14 min',
    image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-9',
    name: 'Carpaccio de Mignon Trufado',
    description: 'Lâminas finíssimas de filé mignon cru bovino, lascas finas de queijo Parmesão italiano maturado por 24 meses, brotos de rúcula baby, alcaparras crocantes e finalização em azeite de trufas brancas.',
    price: 36.00,
    category: 'acompanhamentos',
    badge: 'Fino Tratamento',
    prep_time: '8 min',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-10',
    name: 'Infusion de Citron au Basilic',
    description: 'Limonada de limão siciliano e Tahiti preparada na hora, infundida friamente com folhas selecionadas de manjericão doce e xarope de cana orgânico, servido com gelo translúcido triturado.',
    price: 14.00,
    category: 'bebidas',
    badge: 'Cozinha Fria',
    prep_time: '4 min',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-11',
    name: 'Petit Gâteau au Chocolat Belge',
    description: 'Bolinho quente de chocolate belga Callebaut 70% cacau com coração cremoso derretido, acompanhado de sorvete artesanal de fava de baunilha de Madagascar e coulis de frutas vermelhas.',
    price: 26.00,
    category: 'acompanhamentos',
    badge: 'Sobremesa',
    prep_time: '12 min',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mock-12',
    name: 'Cheesecake de Frutas Amarelas',
    description: 'Base crocante de biscoito amanteigado, creme aerado e aveludado de cream cheese premium, finalizado com compota artesanal de manga, maracujá selvagem e physalis frescas.',
    price: 24.00,
    category: 'acompanhamentos',
    badge: 'Sobremesa',
    prep_time: '8 min',
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80'
  }
];

export default function Catalog() {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  
  // Estados para GPS e busca preditiva com autocompletar
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const whatsappNumber = '5511999999999'; // Insira o telefone da sua loja

  useEffect(() => {
    getProducts()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setDbProducts(res.data);
        }
      })
      .catch(() => console.log('Utilizando cardápio de contingência premium com fotos.'))
      .finally(() => setLoading(false));
  }, []);

  // Opção A: Localização por GPS Automático
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não oferece suporte para geolocalização.');
      return;
    }
    setLocating(true);
    setSuggestions([]);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const street = addr.road || '';
            const number = addr.house_number ? `, ${addr.house_number}` : '';
            const neighborhood = addr.suburb ? ` - ${addr.suburb}` : '';
            const city = addr.city || addr.town || addr.village || '';
            
            const formatted = `${street}${number}${neighborhood}, ${city}`;
            setAddress(formatted || data.display_name);
          } else {
            setAddress(`Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (error) {
          console.error(error);
          alert('Não foi possível converter as coordenadas em endereço.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert('Permissão de geolocalização recusada.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Opção B: Busca inteligente de endereço com sugestões reais (Filtro por Brasil)
  const handleAddressInputChange = (val) => {
    setAddress(val);
    if (typingTimeout) clearTimeout(typingTimeout);

    if (val.length < 4) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5&countrycodes=br`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        console.error(error);
      }
    }, 600);
    setTypingTimeout(timeout);
  };

  const handleSelectSuggestion = (sug) => {
    const addr = sug.address;
    const street = addr.road || '';
    const number = addr.house_number ? `, ${addr.house_number}` : '';
    const neighborhood = addr.suburb ? ` - ${addr.suburb}` : '';
    const city = addr.city || addr.town || addr.village || '';
    
    const formatted = `${street}${number}${neighborhood}, ${city}`;
    setAddress(formatted || sug.display_name);
    setSuggestions([]);
  };

  const displayedProducts = dbProducts.length > 0 ? dbProducts : PREMIUM_MENU_MOCKS;
  const filteredProducts = activeCategory === 'all' 
    ? displayedProducts 
    : displayedProducts.filter(p => p.category.toLowerCase() === activeCategory);
  
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleScrollToCart = () => {
    document.getElementById('checkout-box').scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return alert('Sua sacola de pedidos está vazia.');
    if (!customerName || !address) return alert('Por favor, preencha todos os dados de entrega.');

    let text = '⚜️ *SOLICITAÇÃO DE PEDIDO — MAISON DU BURGER* ⚜️\n\n';
    text += `👤 *Cliente:* ${customerName}\n`;
    text += `📍 *Mesa ou Endereço:* ${address}\n`;
    text += `💳 *Pagamento:* ${paymentMethod}\n\n`;
    text += '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n';
    text += '🛒 *ITENS SELECIONADOS*\n\n';

    cart.forEach((item) => {
      text += `• *${item.qty}x* ${item.name.toUpperCase()}\n`;
      text += `  └ R$ ${(item.price * item.qty).toFixed(2)}\n\n`;
    });

    text += '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n';
    text += `💰 *TOTAL DO PEDIDO:* R$ ${cartTotal.toFixed(2)}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    clearCart();
    setCustomerName('');
    setAddress('');
  };

  return (
    <div className="app-container">
      
      {/* Seção Hero */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '40px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-premium)'
      }}>
        <span style={{ 
          fontSize: '11px', 
          letterSpacing: '0.2em', 
          textTransform: 'uppercase', 
          color: 'var(--accent-gold)', 
          fontWeight: '600', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px' 
        }}>
          <Sparkles size={12} /> Alta Gastronomia Hamburgueira
        </span>
        <h1 className="title-hero">Uma Experiência Excepcional</h1>
        <p className="text-hero">
          Cada corte, queijo e molho é selecionado meticulosamente e preparado de forma artesanal para criar sinergias perfeitas de sabor. Faça sua escolha e solicite diretamente à cozinha.
        </p>
      </div>

      {/* Categorias */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Tudo' },
          { id: 'burgers', label: 'Hambúrgueres' },
          { id: 'acompanhamentos', label: 'Entradas & Sobremesas' },
          { id: 'bebidas', label: 'Bebidas Finas' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '10px 20px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: activeCategory === cat.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
              backgroundColor: activeCategory === cat.id ? 'var(--accent-gold)' : 'var(--bg-surface)',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-premium)',
              cursor: 'pointer'
            }}
            className="transition-premium"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Layout Grid Responsivo */}
      <div className="catalog-layout">
        
        {/* Lista de Produtos */}
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Buscando a seleção do chef...</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>

        {/* Sacola de Compras */}
        <div id="checkout-box" className="cart-container" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-premium)',
          padding: '32px',
          height: 'fit-content',
          boxShadow: 'var(--shadow-premium)',
          position: 'sticky',
          top: '110px',
          zIndex: 80
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px'
          }}>
            <ShoppingBag size={16} style={{ color: 'var(--accent-gold)' }} /> Sacola de Seleção
          </h3>

          {cart.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '8px' }}>Sua sacola está vazia.</p>
              <small style={{ fontSize: '11px' }}>Selecione itens ao lado para iniciar seu pedido.</small>
            </div>
          ) : (
            <div>
              {/* Itens adicionados */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--bg-primary)',
                    paddingBottom: '12px'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px 0', color: 'var(--text-primary)' }}>{item.name}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '500' }}>R$ {item.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        style={{ border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}
                      >-</button>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.qty}</span>
                      <button 
                        onClick={() => addToCart(item)} 
                        style={{ border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário de Finalização */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Detalhes de Entrega</h4>
                
                {/* Campo Nome */}
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 36px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  />
                </div>

                {/* Campo Endereço com Busca e Bússola */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 5 }} />
                  <input
                    type="text"
                    placeholder={locating ? "Localizando..." : "Rua, número e bairro ou Mesa"}
                    value={address}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    disabled={locating}
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 36px', 
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      outline: 'none',
                      backgroundColor: locating ? '#f0eee9' : 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleLocateUser}
                    disabled={locating}
                    title="Usar localização atual"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: locating ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 5
                    }}
                  >
                    <Compass size={16} style={{ animation: locating ? 'spin 1.5s linear infinite' : 'none' }} />
                  </button>

                  {/* Menu Suspenso de Endereços Sugeridos */}
                  {suggestions.length > 0 && (
                    <ul style={{
                      position: 'absolute',
                      top: '44px',
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      zIndex: 90,
                      boxShadow: '0 8px 24px rgba(26, 26, 24, 0.08)',
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }}>
                      {suggestions.map((sug) => {
                        const addr = sug.address;
                        const street = addr.road || '';
                        const number = addr.house_number ? `, ${addr.house_number}` : '';
                        const neighborhood = addr.suburb ? ` - ${addr.suburb}` : '';
                        const city = addr.city || addr.town || addr.village || '';
                        const formattedText = `${street}${number}${neighborhood}, ${city}`;

                        return (
                          <li
                            key={sug.place_id}
                            onClick={() => handleSelectSuggestion(sug)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--bg-primary)',
                            }}
                            className="transition-premium"
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-primary)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {formattedText || sug.display_name}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Forma de Pagamento */}
                <div style={{ position: 'relative' }}>
                  <CreditCard size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 36px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-premium)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      appearance: 'none'
                    }}
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              {/* Subtotais */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  <span>Total do Pedido</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Finalizar no WhatsApp */}
              <button
                onClick={handleSendWhatsApp}
                style={{
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
                  gap: '10px'
                }}
                className="transition-premium"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-gold)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--text-primary)'}
              >
                <Send size={13} /> Enviar Pedido via WhatsApp
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 📱 Barra de Carrinho Suspensa Flutuante (Somente Mobile) */}
      {cart.length > 0 && (
        <div className="mobile-only-cart-bar" style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          backgroundColor: 'var(--text-primary)',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: '30px',
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 99
        }} onClick={handleScrollToCart}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={16} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ fontSize: '12px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ver Sacola ({cart.reduce((sum, i) => sum + i.qty, 0)})</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-gold)' }}>R$ {cartTotal.toFixed(2)}</span>
        </div>
      )}

      {/* Animação do GPS e Ajustes Responsivos */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .mobile-only-cart-bar { display: flex !important; }
        }
      `}</style>

    </div>
  );
}
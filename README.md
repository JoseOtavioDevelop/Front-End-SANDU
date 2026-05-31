-- =========================================================================
-- SCRIPT DE INICIALIZAÇÃO COMPLETO - MAISON DU BURGER
-- Execute este script no console do Beekeeper Studio
-- =========================================================================

CREATE DATABASE IF NOT EXISTS hamburgueria;
USE hamburgueria;

-- 1. TABELA DE USUÁRIOS (Clientes, Funcionários e Administradores)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('CLIENTE', 'FUNCIONARIO', 'ADMINISTRADOR') NOT NULL DEFAULT 'CLIENTE',
    phone VARCHAR(20),
    position VARCHAR(100) NULL, -- Armazena o cargo operacional em texto livre (ex: Chef de Cuisine)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE PRODUTOS (Cardápio)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- burgers, acompanhamentos, bebidas
    badge VARCHAR(50),             -- Assinatura, Sazonal, etc.
    prep_time VARCHAR(20),          -- Ex: 15 min
    image_url LONGTEXT,            -- LONGTEXT para suportar strings Base64 de imagens reais
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE TRANSAÇÕES DO LIVRO CAIXA RECONCILIADO
CREATE TABLE IF NOT EXISTS cash_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('ENTRADA', 'SAIDA') NOT NULL,
    method VARCHAR(50) NOT NULL,    -- PIX, Dinheiro, Cartão de Crédito, Cartão de Débito, Outros
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PEDIDOS PARA HOMOLOGAÇÃO
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDENTE', 'PAGO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    items JSON NOT NULL,            -- Armazena os hambúrgueres e bebidas de forma dinâmica em formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- LIMPEZA E INSERÇÃO DE DADOS INICIAIS (SEEDS)
-- =========================================================================

DELETE FROM cash_transactions;
DELETE FROM products;
DELETE FROM users WHERE email IN ('admin@maison.com', 'jeanluc@maison.com', 'claire@maison.com', 'otavioadm@maison.com');
DELETE FROM orders;

-- Semeando Usuários (Senhas encriptadas usando o algoritmo bcryptjs)
-- Senhas: 'admin123' para os administradores, 'jean123' e 'claire123' para colaboradores
INSERT INTO users (name, email, password, role, phone, position) VALUES 
('Proprietário Geral', 'admin@maison.com', '$2a$10$tZbe9g0Tj89N0O8ZOf9w8eX2n8/4K.mZ8G9M/nEqoKGehBGrf1S.S', 'ADMINISTRADOR', '(11) 99999-9999', 'Diretor Executivo'),
('Otavio Administrador', 'otavioadm@maison.com', '$2a$10$tZbe9g0Tj89N0O8ZOf9w8eX2n8/4K.mZ8G9M/nEqoKGehBGrf1S.S', 'ADMINISTRADOR', '(11) 98888-8888', 'Sócio Proprietário'),
('Jean-Luc Cuisine', 'jeanluc@maison.com', '$2a$10$vG/sJ3gR66zFq3NlF8A4Se0g7tB.oA4yX5z8D.B7bKkR.H5F0D9Z6', 'FUNCIONARIO', '(11) 98888-8888', 'Chef de Cuisine'),
('Claire Salão', 'claire@maison.com', '$2a$10$9r6I.S4Z3mSOf6y/L6SXeO3q7K.wO3X5z8D.B7bKkR.H5F0D9Z6', 'FUNCIONARIO', '(11) 97777-7777', 'Atendente Sênior');

-- Semeando o Cardápio Completo (12 Pratos Gourmet com Imagens do Unsplash)
INSERT INTO products (id, name, description, price, category, badge, prep_time, image_url) VALUES
(1, 'L’Original Gruyère', 'Blend Angus grelhado na brasa, generosa camada de queijo Gruyère suíço derretido, cebolas caramelizadas lentamente no Vinho do Porto e maionese trufada no pão brioche tostado na manteiga de ervas.', 46.00, 'burgers', 'Assinatura', '15 min', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'),
(2, 'Le Truffé Sauvage', 'Blend nobre de costela e fraldinha Angus, queijo Brie derretido, mix de cogumelos Paris e Shimeji salteados na manteiga noisette com raspas de limão siciliano e azeite de trufas brancas.', 52.00, 'burgers', 'Sazonal', '18 min', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'),
(3, 'Le Poulet de Provence', 'Filé de frango marinado em ervas finas de Provence grelhado, queijo de cabra suave cremoso, rúcula selvagem fresca, tomates confitados e molho Dijonnaise artesanal no pão australiano selado.', 39.00, 'burgers', 'Chef Choice', '12 min', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80'),
(4, 'Frites Aromatiques de la Maison', 'Batatas rústicas cortadas manualmente, fritas em dupla cocção para máxima crocância, finalizadas com alecrim fresco tostado, flor de sal Maldon e servidas com maionese de alho negro.', 24.00, 'acompanhamentos', 'Clássico', '10 min', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80'),
(5, 'Croquetes de Costela Trufados', 'Quatro unidades de croquetes cremosos de costela bovina desfiada cozida lentamente por 12 horas, empanados em farinha panko crocante, servidos com geléia de pimenta defumada de fabricação própria.', 28.00, 'acompanhamentos', 'Para Compartilhar', '14 min', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'),
(6, 'Nectar de Frutas Vermelhas e Hibisco', 'Infusão gelada de hibisco orgânico com calda artesanal de framboesa, amora e mirtilo frescos, finalizado com água tônica premium e fatias finas de limão siciliano.', 16.00, 'bebidas', 'Sem Álcool', '5 min', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80'),
(7, 'Le Bacon Fumé au Bourbon', 'Blend Angus 150g, generosas fatias de queijo Cheddar inglês maturado derretido, tiras crocantes de bacon glaceado em xarope de bordo orgânico e redução artesanal de barbecue ao uísque Bourbon.', 48.00, 'burgers', 'Destaque', '16 min', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80'),
(8, 'L’Atelier Végétarien', 'Medalhão artesanal de grão-de-bico tostado com sementes de girassol, queijo de coalho selado na chapa, abobrinha e berinjela grelhadas ao azeite de ervas finas e pesto fresco de manjericão genovês.', 38.00, 'burgers', 'Veggie', '14 min', 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=600&q=80'),
(9, 'Carpaccio de Mignon Trufado', 'Lâminas finíssimas de filé mignon cru bovino, lascas finas de queijo Parmesão italiano maturado por 24 meses, brotos de rúcula baby, alcaparras crocantes e finalização em azeite de trufas brancas.', 36.00, 'acompanhamentos', 'Fino Tratamento', '8 min', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
(10, 'Infusion de Citron au Basilic', 'Limonada de limão siciliano e Tahiti preparada na hora, infundida friamente com folhas selecionadas de manjericão doce e xarope de cana orgânico, servido com gelo translúcido triturado.', 14.00, 'bebidas', 'Cozinha Fria', '4 min', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
(11, 'Petit Gâteau au Chocolat Belge', 'Bolinho quente de chocolate belga Callebaut 70% cacau com coração cremoso derretido, acompanhado de sorvete artesanal de fava de baunilha de Madagascar e coulis de frutas vermelhas.', 26.00, 'acompanhamentos', 'Sobremesa', '12 min', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'),
(12, 'Cheesecake de Frutas Amarelas', 'Base crocante de biscoito amanteigado, creme aerado e aveludado de cream cheese premium, finalizado com compota artesanal de manga, maracujá selvagem e physalis frescas.', 24.00, 'acompanhamentos', 'Sobremesa', '8 min', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80');

-- Semeando Lançamentos Iniciais de Caixa (Histórico para o Dashboard)
INSERT INTO cash_transactions (description, amount, type, method, date) VALUES
('Faturamento Consolidado - Abertura Semanal', 12500.00, 'ENTRADA', 'Dinheiro', NOW() - INTERVAL 5 DAY),
('Pagamento de Fornecedor de Carnes Nobres', 3450.00, 'SAIDA', 'PIX', NOW() - INTERVAL 4 DAY),
('Venda Homologada - Pedido #1021', 142.00, 'ENTRADA', 'PIX', NOW() - INTERVAL 3 DAY),
('Aquisição de Gás GLP para o Atelier', 280.00, 'SAIDA', 'Dinheiro', NOW() - INTERVAL 2 DAY),
('Venda Homologada - Pedido #1022', 218.00, 'ENTRADA', 'Cartão de Crédito', NOW() - INTERVAL 1 DAY);

-- Semeando Pedidos Iniciais na Fila de Homologação
INSERT INTO orders (customer_name, address, payment_method, total, status, items) VALUES
('Carlos Mendes', 'Rua das Flores, 142 - Centro, São Paulo', 'PIX', 92.00, 'PAGO', '[{"id": "mock-1", "name": "L’Original Gruyère", "qty": 2, "price": 46.00}]'),
('Mariana Rocha', 'Mesa 04 (Salão Central)', 'Cartão de Crédito', 128.00, 'PENDENTE', '[{"id": "mock-2", "name": "Le Truffé Sauvage", "qty": 1, "price": 52.00}, {"id": "mock-4", "name": "Frites de la Maison", "qty": 1, "price": 24.00}]'),
('Fernando Alencar', 'Av. Paulista, 1000 - Bela Vista, São Paulo', 'Cartão de Débito', 62.00, 'PENDENTE', '[{"id": "mock-3", "name": "Le Poulet de Provence", "qty": 1, "price": 39.00}, {"id": "mock-6", "name": "Nectar de Frutas", "qty": 1, "price": 16.00}]');

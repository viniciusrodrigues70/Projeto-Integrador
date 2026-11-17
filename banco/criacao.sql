Create Database if not exists Banco_Alimentos;
USE Banco_Alimentos;

-- Vitor Calheiros
Create table if not exists Usuario(
    id_usuario int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    senha varchar(100) not null,
    tipo enum('OPERADOR',"ADMINISTRADOR") not null
);

Create table if not exists Doador(
    id_doador int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null,
    telefone varchar(20),
    tipo_doador enum(
        'EMPRESA',
        'PESSOA_FISICA',
        'INSTITUICAO'
    ) not null
);


insert into Usuario (nome, email,senha,tipo)
values ('Zé', 'ZE@gmail.com', '123456', 'ADMINISTRADOR'),
       ('Ana', "Ana@gmail.com", 'admin', 'ADMINISTRADOR'),
       ('Carlos', 'carlos@gmail.com', 'hash_exemplo_03', 'OPERADOR'),
        ('Maria', 'maria@gmail.com', 'hash_exemplo_04', 'OPERADOR'),
        ('Joao', 'joao@gmail.com', 'hash_exemplo_05', 'OPERADOR'),
        ('Pedro', 'pedro@gmail.com', 'hash_exemplo_06', 'OPERADOR'),
        ('Julia', 'julia@gmail.com', 'hash_exemplo_07', 'OPERADOR'),
        ('Lucas', 'lucas@gmail.com', 'hash_exemplo_08', 'OPERADOR'),
        ('Fernanda', 'fernanda@gmail.com', 'hash_exemplo_09', 'OPERADOR'),
        ('Rafael', 'rafael@gmail.com', 'hash_exemplo_10', 'OPERADOR');

insert into Doador(nome, email,telefone, tipo_doador)
values ('Vincente', 'V@gmail.com', '82 98100-0077', 'PESSOA_FISICA'),
       ('Marcelo', 'Marc@gmail.com', '82 97777-7777', 'PESSOA_FISICA'),
       ('Nestlé', 'doacoes@nestle.exemplo', '82 90000-0001', 'EMPRESA'),
        ('Carrefour', 'doacoes@carrefour.com.br', '82981000004', 'EMPRESA'),
        ('Igreja Esperanca', 'contato@esperanca.com', '82981000005', 'INSTITUICAO'),
        ('Joana', 'joana@gmail.com', '82981000006', 'PESSOA_FISICA'),
        ('Assuncao Alimentos', 'contato@assuncao.com', '82981000007', 'EMPRESA'),
        ('Instituto Social', 'instituto@email.com', '82981000008', 'INSTITUICAO'),
        ('Roberto', 'roberto@gmail.com', '82981000009', 'PESSOA_FISICA'),
        ('Mercadinho', 'mercadinho@email.com', '82981000010', 'EMPRESA');




-- Vinícius Rodrigues 

Create table if not exists Produto (
    id_produto int auto_increment primary key,
    nome varchar (100) not null,
    descricao varchar (300) not null,
    peso decimal(5,2),
    categoria varchar(50) not null,
    quantidade int not null

    check (peso > 0)
);

Create table  if not exists Lote (
    id_lote int auto_increment primary key,
    validade date not null,
    qtd_inicial int not null,
    qtd_atual int not null,
    data_recebimento date not null,
    id_produto int not null,
    id_doador int not null,
    foreign key (id_produto) references Produto(id_produto),
    foreign key (id_doador) references Doador(id_doador)

    
    check (qtd_inicial > 0),
    check (qtd_atual >= 0),
    check (qtd_atual <= qtd_inicial),
    check (validade >= data_recebimento)
);

Create table Item_Entrega (
    id_item int auto_increment primary key,
    id_produto int not null,
    quantidade int not null,

    foreign key (id_produto) references Produto(id_produto)
);

insert into Produto (nome, descricao, peso, categoria, quantidade) VALUES
    ('Arroz Branco Tipo 1', 'Pacote de arroz branco', 5.00, 'Grãos e Cereais', 50),
    ('Feijão Carioca', 'Pacote de feijão carioca turquesa', 10.00, 'Grãos e Cereais', 80),
    ('Leite Integral', 'Caixa de leite integral 1L', 8.00, 'Laticínios', 120),
    ('Macarrão Espaguete', 'Pacote de massa espaguete', 4.50, 'Massas', 60),
    ('Acucar Refinado', 'Pacote de acucar refinado', 3.00, 'Mercearia'),
    ('Farinha de Trigo', 'Pacote de farinha de trigo', 6.00, 'Farinhas'),
    ('Oleo de Soja', 'Garrafa de oleo de soja', 9.90, 'Oleos'),
    ('Cafe em Po', 'Pacote de cafe torrado e moido', 16.25, 'Bebidas'),
    ('Biscoito Cream Cracker', 'Pacote de biscoito salgado', 3.40, 'Biscoitos'),
    ('Farinha de Milho', 'Pacote de farinha de milho', 9.50, 'Farinhas');

insert into Lote (validade, qtd_inicial, qtd_atual, data_recebimento, id_produto, id_doador) VALUES
    ('2027-05-15', 50, 50, '2026-11-10', 1, 1),
    ('2027-03-20', 80, 65, '2026-11-12', 2, 2),
    ('2027-01-30', 120, 120, '2026-11-15', 3, 3), 
    ('2027-08-10', 60, 40, '2026-11-16', 4, 3),
    ('2027-06-20', 40, 35, '2026-11-10', 5, 4),
    ('2027-04-15', 70, 60, '2026-11-11', 6, 5),
    ('2027-02-10', 90, 75, '2026-11-12', 7, 6),
    ('2027-09-25', 30, 30, '2026-11-13', 8, 7),
    ('2027-07-18', 55, 45, '2026-11-14', 9, 8),
    ('2027-10-05', 65, 50, '2026-11-15', 10, 9);

insert into Item_Entrega (id_produto, quantidade) values
    (1, 10),
    (2, 15),
    (3, 20),
    (4, 12),
    (5, 8),
    (6, 25),
    (7, 10),
    (8, 30),
    (9, 18),
    (10, 14);
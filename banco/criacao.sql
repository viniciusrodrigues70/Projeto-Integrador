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
       ('Carlos', 'carlos@gmail.com', 'C234', 'OPERADOR'),
        ('Maria', 'maria@gmail.com', '3008', 'OPERADOR'),
        ('Joao', 'joao@gmail.com', 'jKLMNP', 'OPERADOR'),
        ('Pedro', 'pedro@gmail.com', 'YOI#e', 'OPERADOR'),
        ('Julia', 'julia@gmail.com', 'Confusa234', 'OPERADOR'),
        ('Lucas', 'lucas@gmail.com', '097lucas', 'OPERADOR'),
        ('Fernanda', 'fernanda@gmail.com', 'Feh567', 'OPERADOR'),
        ('Rafael', 'rafael@gmail.com', 'vasco67', 'OPERADOR');

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

select * from Doador where tipo_doador = "PESSOA_FISICA";
select * from Usuario;


-- Vinícius Rodrigues 

Create table if not exists Produto (
    id_produto int auto_increment primary key,
    nome varchar (100) not null,
    descricao varchar (300) not null,
    peso decimal(5,2),
    categoria varchar(50) not null,
    quantidade int not null,

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
    foreign key (id_doador) references Doador(id_doador),

    
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
    ('Acucar Refinado', 'Pacote de acucar refinado', 3.00, 'Mercearia', 42),
    ('Farinha de Trigo', 'Pacote de farinha de trigo', 6.00, 'Farinhas', 35),
    ('Oleo de Soja', 'Garrafa de oleo de soja', 9.90, 'Oleos', 20),
    ('Cafe em Po', 'Pacote de cafe torrado e moido', 16.25, 'Bebidas', 45),
    ('Biscoito Cream Cracker', 'Pacote de biscoito salgado', 3.40, 'Biscoitos', 65),
    ('Farinha de Milho', 'Pacote de farinha de milho', 9.50, 'Farinhas', 21);

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

    select l.id_lote, p.nome as produto, d.nome as doador, l.qtd_inicial, l.qtd_atual, l.validade
from Lote as l
inner join Produto as p
    on l.id_produto = p.id_produto
inner join Doador as d
    on l.id_doador = d.id_doador;

select p.nome as produto, l.id_lote, l.qtd_inicial, l.qtd_atual, date_format(l.validade, '%d/%m/%Y') as validade
from Produto as p
inner join Lote as l
    on p.id_produto = l.id_produto;

-- Marcio Daniel

Create table if not exists Familia(
	id_familia int primary key,
    nome_responsavel varchar (200),
    cpf_responsavel varchar(14),
    num_integrantes int,
    endereco varchar(260),
    telefone varchar(20)
);

Create table if not exists Entrega_cesta(
	id_entrega int primary key,
    data_entrega date,
    observacao varchar(255),
    id_familia int,
    foreign key (id_familia) references familia(id_familia)
);

insert into Familia (id_familia, nome_responsavel, cpf_responsavel, num_integrantes, endereco, telefone)
values (1, 'Ariana Grande', '111.456.333-02', 4, 'Rua das Flores, 123', '(82) 99999-1111'),
       (2, 'Oliver Tree', '234.567.890-12', 3, 'Av. Principal, 456', '(82) 98888-2222'),
       (3, 'Joana Darc', '345.678.901-23', 5, 'Rua do Sol, 789', '(82) 97777-3333'),
       (4, 'Renato Vasconcelos', '456.789.012-34', 2, 'Rua da Paz, 101', '(82) 96666-4444'),
       (5, 'Camila Pitanga', '567.890.123-45', 4, 'Av. Atlântica, 202', '(82) 95555-5555'),
       (6, 'Thiago Lacerda', '678.901.234-56', 3, 'Rua do Catete, 303', '(82) 94444-6666'),
       (7, 'Bianca Andrade', '789.012.345-67', 6, 'Praça da Matriz, 404', '(82) 93333-7777'),
       (8, 'Rodrigo Hilbert', '890.123.456-78', 2, 'Rua dos Coqueiros, 505', '(82) 92222-8888'),
       (9, 'Tatiana Lima', '901.234.567-89', 5, 'Rua Nova, 606', '(82) 91111-9999'),
       (10, 'Henrique Fogaça', '012.345.678-90', 3, 'Travessa da Praia, 707', '(82) 90000-0000');

insert into Entrega_cesta (id_entrega, data_entrega, observacao, id_familia) values 
    (1, '2026-10-01', 'Entrega realizada com sucesso.', 1),
    (2, '2026-10-02', 'Ausente, pórem entregue logo após', 2),
    (3, '2026-10-03', 'Cesta padrão entregue ao responsável.', 3);
drop database if exists Banco_Alimentos;
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
        'EMPRESA/INSTITUICAO',
        'PESSOA_FISICA'
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

insert into Doador(nome, email,telefone, tipo_doador) values 
		('Vincente', 'V@gmail.com', '82 98100-0077', 'PESSOA_FISICA'),
		('Marcelo', 'Marc@gmail.com', '82 97777-7777', 'PESSOA_FISICA'),
		('Nestlé', 'doacoes@nestle.exemplo', '82 90000-0001', 'EMPRESA/INSTITUICAO'),
        ('Carrefour', 'doacoes@carrefour.com.br', '82981000004', 'EMPRESA/INSTITUICAO'),
        ('Igreja Esperanca', 'contato@esperanca.com', '82981000005', 'EMPRESA/INSTITUICAO'),
        ('Joana', 'joana@gmail.com', '82981000006', 'PESSOA_FISICA'),
        ('Assuncao Alimentos', 'contato@assuncao.com', '82981000007', 'EMPRESA/INSTITUICAO'),
        ('Instituto Social', 'instituto@email.com', '82981000008', 'EMPRESA/INSTITUICAO'),
        ('Roberto', 'roberto@gmail.com', '82981000009', 'PESSOA_FISICA'),
        ('Mercadinho', 'mercadinho@email.com', '82981000010', 'EMPRESA/INSTITUICAO');

select nome, email, CONCAT('(', LEFT(telefone, 2), ') ', SUBSTRING(telefone, 3, 5), '-', RIGHT(telefone, 4)) AS telefone, tipo_doador from Doador where tipo_doador = "PESSOA_FISICA";
select * from Usuario;

-- Vinícius Rodrigues 

Create table if not exists Produto (
    id_produto int auto_increment primary key,
    nome varchar (100) not null,
    descricao varchar (300) not null,
    peso decimal(5,2),
    categoria varchar(50) not null,
    quantidade int not null
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

select l.id_lote, p.nome as produto, d.nome as doador, l.qtd_inicial, l.qtd_atual, date_format(l.validade, '%d/%m/%Y') as validade 
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
	id_familia int auto_increment primary key,
    nome_responsavel varchar (200) not null,
    cpf_responsavel varchar(14) not null,
    num_integrantes int not null,
    endereco varchar(260) not null,
    telefone varchar(20)
);

Create table if not exists Entrega_cesta(
	id_entrega int auto_increment primary key,
    data_entrega date not null,
    observacao varchar(255),
    id_familia int not null,
    foreign key (id_familia) references familia(id_familia)
);

insert into Familia (nome_responsavel, cpf_responsavel, num_integrantes, endereco, telefone)
values ('Ariana Grande', '111.456.333-02', 4, 'Rua das Flores, 123', '(82) 99999-1111'),
       ('Oliver Tree', '234.567.890-12', 3, 'Av. Principal, 456', '(82) 98888-2222'),
       ('Joana Darc', '345.678.901-23', 5, 'Rua do Sol, 789', '(82) 97777-3333'),
       ('Renato Vasconcelos', '456.789.012-34', 2, 'Rua da Paz, 101', '(82) 96666-4444'),
       ('Camila Pitanga', '567.890.123-45', 4, 'Av. Atlântica, 202', '(82) 95555-5555'),
       ('Thiago Lacerda', '678.901.234-56', 3, 'Rua do Catete, 303', '(82) 94444-6666'),
       ('Bianca Andrade', '789.012.345-67', 6, 'Praça da Matriz, 404', '(82) 93333-7777'),
       ('Rodrigo Hilbert', '890.123.456-78', 2, 'Rua dos Coqueiros, 505', '(82) 92222-8888'),
       ('Tatiana Lima', '901.234.567-89', 5, 'Rua Nova, 606', '(82) 91111-9999'),
       ('Henrique Fogaça', '012.345.678-90', 3, 'Travessa da Praia, 707', '(82) 90000-0000');

insert into Entrega_cesta (data_entrega, observacao, id_familia) values 
    ('2026-10-01', 'Entrega realizada com sucesso.', 1),
    ('2026-10-02', 'Ausente, pórem entregue logo após', 2),
    ('2026-10-03', 'Cesta padrão entregue ao responsável.', 3);


select f.nome_responsavel as nome, LPAD(RIGHT(f.cpf_responsavel, 7), 12, '*') AS CPF
from Familia f
inner join Entrega_cesta ec
on f.id_familia = ec.id_familia;


CREATE TABLE IF NOT EXISTS RecuperacaoSenha (
    id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recuperacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
        ON DELETE CASCADE
);


ALTER TABLE Item_Entrega
    ADD COLUMN id_entrega INT NOT NULL,
    ADD CONSTRAINT fk_item_entrega_entrega
        FOREIGN KEY (id_entrega) REFERENCES Entrega_cesta(id_entrega);

insert into Item_Entrega (id_entrega, id_produto, quantidade) values
    ((select id_entrega from Entrega_cesta where id_familia = 1 and data_entrega = '2026-10-01'), 1, 10),
    ((select id_entrega from Entrega_cesta where id_familia = 1 and data_entrega = '2026-10-01'), 2, 15),
    ((select id_entrega from Entrega_cesta where id_familia = 1 and data_entrega = '2026-10-01'), 3, 20),
    ((select id_entrega from Entrega_cesta where id_familia = 1 and data_entrega = '2026-10-01'), 4, 12),
    ((select id_entrega from Entrega_cesta where id_familia = 2 and data_entrega = '2026-10-02'), 5, 8),
    ((select id_entrega from Entrega_cesta where id_familia = 2 and data_entrega = '2026-10-02'), 6, 25),
    ((select id_entrega from Entrega_cesta where id_familia = 2 and data_entrega = '2026-10-02'), 7, 10),
    ((select id_entrega from Entrega_cesta where id_familia = 3 and data_entrega = '2026-10-03'), 8, 30),
    ((select id_entrega from Entrega_cesta where id_familia = 3 and data_entrega = '2026-10-03'), 9, 18),
    ((select id_entrega from Entrega_cesta where id_familia = 3 and data_entrega = '2026-10-03'), 10, 14);

CREATE INDEX idx_entrega_familia_data
    ON Entrega_cesta (id_familia, data_entrega);

CREATE INDEX idx_lote_produto_validade
    ON Lote (id_produto, validade, id_lote);


UPDATE Produto AS p
SET p.quantidade = (
    SELECT COALESCE(SUM(l.qtd_atual), 0)
    FROM Lote AS l
    WHERE l.id_produto = p.id_produto
);
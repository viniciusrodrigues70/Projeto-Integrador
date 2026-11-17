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


insert into Usuario (nome, email, senha, tipo)
values ('Zé', 'ZE@gmail.com', '123456', 'ADMINISTRADOR'),
       ('Ana', "Ana@gmail.com", 'admin', 'ADMINISTRADOR');

insert into Doador(nome, email, telefone, tipo_doador)
values ('Vincente', 'V@gmail.com', '82 98100-0077', 'PESSOA_FISICA'),
       ('Marcelo', 'Marc@gmail.com', '82 97777-7777', 'PESSOA_FISICA'),
       ('Nestlé', 'doacoes@nestle.exemplo', '82 90000-0001', 'EMPRESA');

-- Vinícius Rodrigues 

Create table if not exists Produto (
    id_produto int auto_increment primary key,
    nome varchar (100) not null,
    descricao varchar (300) not null,
    peso decimal(5,2),
    categoria varchar(50) not null,
    quantidade int not null
);

Create table Lote (
    id_lote int auto_increment primary key,
    validade date not null,
    qtd_inicial int not null,
    qtd_atual int not null,
    data_recebimento date not null,
    id_produto int not null,
    id_doador int not null
    foreign key (id_produto) references Produto(id_produto),
    foreign key (id_doador) references Doador(id_doador)
);

insert into Produto VALUES
('Arroz Branco Tipo 1', 'Pacote de arroz branco', 5.00, 'Grãos e Cereais', 50),
('Feijão Carioca', 'Pacote de feijão carioca turquesa', 1.00, 'Grãos e Cereais', 80),
('Leite Integral', 'Caixa de leite integral 1L', 1.00, 'Laticínios', 120),
('Macarrão Espaguete', 'Pacote de massa espaguete', 0.50, 'Massas', 60);

INSERT INTO Lote VALUES
('2027-05-15', 50, 50, '2026-11-10', 1, 1),
('2027-03-20', 80, 65, '2026-11-12', 2, 2),
('2027-01-30', 120, 120, '2026-11-15', 3, 3), 
('2027-08-10', 60, 40, '2026-11-16', 4, 3);

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

Create table if not exists Item_entrega(
	id_item int primary key,
    id_produto int,
    quantidade int,
    foreign key (id_produto) references produto(id_produto)
);

insert into Familia (id_familia, nome_responsavel, cpf_responsavel, num_integrantes, endereco, telefone)
values (1, 'Ariana Grande', '111.456.333-02', 4, 'Rua das Flores, 123', '(82) 99999-1111'),
	   (2, 'Oliver tree', '234.567.890-12', 3, 'Av. Principal, 456', '(82) 98888-2222'),
	   (3, 'Joana darc', '345.678.901-23', 5, 'Rua do Sol, 789', '(82) 97777-3333');

insert into Entrega_cesta (id_entrega, data_entrega, observacao, id_familia)
values (1, '2026-10-01', 'Entrega realizada com sucesso.', 1),
       (2, '2026-10-02', 'Ausente, pórem entregue logo após', 2),
       (3, '2026-10-03', 'Cesta padrão entregue ao responsável.', 3);

insert into Item_entrega (id_item, id_produto, quantidade)
values (1, 1, 2),
	   (2, 2, 1),
	   (3, 3, 2);

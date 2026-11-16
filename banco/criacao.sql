Create Database if not exists Banco_Alimentos;
USE Banco_Alimentos;


Create table Usuario(
    Id_Usuario int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null,
    senha varchar(100) not null,
    tipo enum('OPERADOR',"ADMINISTRADOR") not null
);

Create table Doador(
    Id_Doador int auto_increment primary key,
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
       ('Ana', "Ana@gmail.com", 'admin', 'ADMINISTRADOR');

insert into Doador(nome, email,telefone, tipo_doador)
values ('Vincente', 'V@gmail.com', '82 98100-0077', 'PESSOA_FISICA'),
       ('Marcelo', 'Marc@gmail.com', '82 97777-7777', 'PESSOA_FISICA'),
       ('Nestlé', 'doacoes@nestle.exemplo', '82 90000-0001', 'EMPRESA');
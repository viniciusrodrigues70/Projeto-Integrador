# 🍎 Banco de Alimentos

### Sistema Web de Gerenciamento de Doações, Estoque e Distribuição de Cestas Básicas

---

## 📌 Sobre o Projeto

O **Banco de Alimentos** é um sistema web desenvolvido como Projeto Integrado do 4º Bimestre de 2026, no curso Técnico em Desenvolvimento de Sistemas do Instituto Federal de Alagoas (IFAL).

O projeto tem como objetivo auxiliar instituições sociais no gerenciamento de doações de alimentos, controle de estoque e distribuição de cestas básicas para famílias cadastradas.

A aplicação busca facilitar a organização dos alimentos recebidos, acompanhar suas datas de validade, controlar as quantidades disponíveis e garantir uma distribuição eficiente e segura dos produtos.

O desenvolvimento integra conhecimentos das disciplinas de **Programação Orientada a Objetos (POO), Fundamentos de Bancos de Dados e Programação Web**.

## 🎯 Objetivos

- Organizar o cadastro de doadores, produtos e famílias.
- Registrar doações recebidas e controlar seus respectivos lotes.
- Monitorar a quantidade disponível de cada alimento.
- Acompanhar as datas de validade dos produtos.
- Gerenciar a distribuição de cestas básicas.
- Manter o histórico de atendimentos das famílias.
- Disponibilizar relatórios para auxiliar a administração da instituição.

## ⚙️ Funcionalidades

### 1. Autenticação
- Login de usuários.
- Controle de sessão.
- Proteção das funcionalidades administrativas.
- Encerramento de sessão (logout).

### 2. Gerenciamento de Doadores
- Cadastro de doadores.
- Listagem de doadores.
- Atualização de informações.
- Remoção de registros.

### 3. Gerenciamento de Produtos
- Cadastro de alimentos.
- Classificação por categorias.
- Listagem de produtos.
- Atualização e remoção de registros.

### 4. Gerenciamento de Famílias
- Cadastro de famílias beneficiadas.
- Registro dos dados do responsável.
- Registro da quantidade de integrantes.
- Consulta e atualização de informações.
- Histórico de atendimento.

### 5. Controle de Estoque
- Registro de lotes recebidos.
- Controle de quantidade por lote.
- Consulta do estoque por produto.
- Monitoramento das datas de validade.
- Identificação de produtos próximos do vencimento.

### 6. Distribuição de Cestas Básicas
- Registro de entregas para famílias cadastradas.
- Seleção dos produtos e quantidades.
- Baixa automática no estoque.
- Consulta do histórico de entregas.
- Verificação do limite mensal de atendimento.

### 7. Relatórios
- Lotes próximos do vencimento nos próximos 30 dias.
- Doações realizadas por doador.
- Doações agrupadas por mês.
- Quantidade de famílias atendidas por mês.

## 📋 Regras de Negócio

O sistema deverá respeitar as seguintes regras:

- Produtos vencidos não podem ser entregues.
- A distribuição deverá priorizar os lotes com validade mais próxima (FEFO — First Expired, First Out).
- Uma família poderá receber, no máximo, uma cesta por mês, respeitando o limite configurado.
- A gravação de uma entrega e a baixa das quantidades no estoque deverão acontecer dentro de uma única transação no banco de dados.
- Caso ocorra algum erro durante a operação, a transação deverá ser desfeita (ROLLBACK), preservando a integridade dos dados.

## 💻 Tecnologias Utilizadas

### Backend
- **JavaScript:** linguagem utilizada na implementação da lógica da aplicação.
- **Node.js:** ambiente de execução JavaScript.
- **Express.js:** framework para construção das rotas e da API REST.
- **MySQL2:** biblioteca de comunicação entre Node.js e MySQL.
- **MySQL:** sistema gerenciador de banco de dados relacional.
- **bcrypt:** biblioteca para proteção de senhas por meio de hash.
- **dotenv:** gerenciamento de variáveis de ambiente.

### Frontend
- **HTML5:** estrutura das páginas.
- **CSS3:** estilização e responsividade.
- **JavaScript:** interatividade e comunicação com a API utilizando Fetch API.

### Ferramentas de Desenvolvimento
- **Visual Studio Code:** editor de código.
- **MySQL Workbench:** gerenciamento do banco de dados.
- **Git:** controle de versão.
- **GitHub:** hospedagem do repositório e colaboração.
- **Insomnia:** testes das requisições HTTP.
- **brModelo:** modelagem do banco de dados.
- **draw.io:** elaboração dos diagramas.
- **Live Server:** execução local das páginas frontend durante o desenvolvimento.

## 🏗️ Arquitetura do Projeto

O backend utiliza uma arquitetura organizada em camadas, separando as responsabilidades da aplicação.

| Camada | Responsabilidade |
|---|---|
| Models | Representação das entidades por meio de classes. |
| DAO | Comunicação com o banco de dados e execução de consultas SQL. |
| Controllers | Recebimento e processamento das requisições HTTP. |
| Services | Implementação das regras de negócio. |
| Routes | Definição dos endpoints da API. |
| Middlewares | Autenticação e validação de requisições. |
| Config | Configurações de conexão e ambiente. |

O frontend será desenvolvido de maneira independente, utilizando HTML, CSS e JavaScript puro, comunicando-se com o backend por meio de requisições HTTP.

## 📂 Estrutura do Repositório

```text
BANCO-DE-ALIMENTOS/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── dao/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   ├── pages/
│   │   └── assets/
│   │
│   └── index.html
│
├── banco/
│   ├── DER.md
│   ├── modelo-logico.pdf
│   ├── criacao.sql
│   └── povoamento.sql
│
├── diagramas/
│   └── diagrama-classes.png
│
├── diario/
│   ├── integrante-1.md
│   ├── integrante-2.md
│   └── integrante-3.md
│
├── USO_DE_IA.md
├── README.md
└── .gitignore
```

## 👥 Equipe de Desenvolvimento

| Integrante | Responsabilidade |
|---|---|
| [Vinícius Rodrigues] | Cadastro de Doadores |
| [Vitor Calheiros] | Cadastro de Produtos |
| [Márcio Daniel] | Cadastro de Famílias |

Todos os integrantes participam do desenvolvimento e da integração das funcionalidades do sistema.

## 🚀 Como Executar o Projeto

### Pré-requisitos

Antes de iniciar, é necessário possuir:

- Node.js instalado.
- MySQL instalado e configurado.
- MySQL Workbench (recomendado).
- Git instalado.
- Visual Studio Code.
- Extensão Live Server do VS Code (recomendada).

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Configurar o banco de dados

Abra o MySQL Workbench e execute os arquivos SQL na seguinte ordem:

1. `banco/criacao.sql`
2. `banco/povoamento.sql`

Isso criará a estrutura do banco e inserirá os registros iniciais.

### 3. Configurar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` com base no `.env.example` e configure as informações de conexão com o MySQL.

### 4. Iniciar o backend

```bash
npm run dev
```

O servidor Express ficará responsável por disponibilizar a API para o frontend.

### 5. Iniciar o frontend

Abra a pasta `frontend/` no Visual Studio Code.

Localize o arquivo `index.html`, clique com o botão direito e selecione:

**Open with Live Server**

O frontend será aberto no navegador por meio de um endereço local.

As páginas utilizarão JavaScript e Fetch API para realizar requisições ao backend.

**Observação:** caso frontend e backend sejam executados em portas diferentes, será necessário configurar o CORS no Express para permitir a comunicação entre eles.

## 🗄️ Modelagem do Banco de Dados

O banco de dados será desenvolvido utilizando MySQL, seguindo os conceitos de modelagem conceitual e lógica.

As entidades principais do sistema incluem:

- Usuário.
- Doador.
- Produto.
- Lote.
- Família.
- Entrega de Cesta.
- Item da Entrega.

A modelagem deverá respeitar as restrições de integridade e os relacionamentos necessários para garantir a consistência das informações.

Os diagramas e scripts SQL estão disponíveis na pasta `banco/`.

## 📊 Documentação e Acompanhamento

O desenvolvimento do projeto será acompanhado por meio de:

- **README.md:** documentação geral do sistema.
- **DER e modelo lógico:** documentação da estrutura do banco de dados.
- **Diagrama de Classes:** representação da arquitetura orientada a objetos.
- **Diários de Bordo:** registros individuais das atividades semanais.
- **USO_DE_IA.md:** registro da utilização de ferramentas de Inteligência Artificial.
- **GitHub:** histórico de commits e acompanhamento das tarefas.

## 🎓 Informações Acadêmicas

**Instituição:** Instituto Federal de Alagoas (IFAL)  
**Campus:** Maceió  
**Curso:** Técnico em Desenvolvimento de Sistemas  
**Disciplinas:** Programação Orientada a Objetos, Fundamentos de Bancos de Dados e Programação Web.  
**Período:** 4º Bimestre de 2026  
**Projeto:** Banco de Alimentos  
**Tema:** 10

---

*Projeto acadêmico desenvolvido como parte do Projeto Integrado do 4º Bimestre de 2026 — IFAL Campus Maceió.*
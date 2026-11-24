const pool = require("../config/database");
const produtoDAO = require("../dao/ProdutoDAO");
const doadorDAO = require("../dao/DoadorDAO");
const familiaDAO = require("../dao/FamiliaDAO");
const loteDAO = require("../dao/LoteDAO");
const entregaDAO = require("../dao/EntregaCestaDAO");
const relatorioDAO = require("../dao/Relatorio");

const estoqueService = require("../services/EstoqueService");
const entregaService = require("../services/EntregaService");

function validarId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validarFamilia(familia) {
  if (!familia.nome_responsavel?.trim()) {
    throw new Error("O nome do responsável é obrigatório.");
  }

  if (!familia.cpf_responsavel?.trim()) {
    throw new Error("O CPF do responsável é obrigatório.");
  }

  if (
    !Number.isInteger(Number(familia.num_integrantes)) ||
    Number(familia.num_integrantes) < 1
  ) {
    throw new Error("Informe uma quantidade válida de integrantes.");
  }

  if (!familia.endereco?.trim()) {
    throw new Error("O endereço é obrigatório.");
  }
}

module.exports = {
  async listarProdutos(req, res, next) {
    try {
      res.json(await produtoDAO.listar());
    } catch (erro) {
      next(erro);
    }
  },

  async criarProduto(req, res, next) {
    try {
      await produtoDAO.inserir(req.body);
      res.status(201).json({ mensagem: "Produto cadastrado." });
    } catch (erro) {
      next(erro);
    }
  },

  async editarProduto(req, res, next) {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({ mensagem: "ID de produto inválido." });
      }

      await produtoDAO.editar(req.params.id, req.body);
      res.json({ mensagem: "Produto atualizado." });
    } catch (erro) {
      next(erro);
    }
  },

  async removerProduto(req, res, next) {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({ mensagem: "ID de produto inválido." });
      }

      await produtoDAO.remover(req.params.id);
      res.json({ mensagem: "Produto removido." });
    } catch (erro) {
      next(erro);
    }
  },

  async listarDoadores(req, res, next) {
    try {
      res.json(await doadorDAO.listar());
    } catch (erro) {
      next(erro);
    }
  },

  async criarDoador(req, res, next) {
    try {
      await doadorDAO.criar(req.body);
      res.status(201).json({ mensagem: "Doador cadastrado." });
    } catch (erro) {
      next(erro);
    }
  },

  async listarFamilias(req, res, next) {
    try {
      res.json(await familiaDAO.listarTodos());
    } catch (erro) {
      next(erro);
    }
  },

  async criarFamilia(req, res, next) {
    try {
      validarFamilia(req.body);

      const existente = await familiaDAO.buscarPorCPF(
        req.body.cpf_responsavel.trim()
      );

      if (existente) {
        return res.status(409).json({
          mensagem: "Já existe uma família cadastrada com esse CPF.",
        });
      }

      const familia = await familiaDAO.criar({
        nome_responsavel: req.body.nome_responsavel.trim(),
        cpf_responsavel: req.body.cpf_responsavel.trim(),
        num_integrantes: Number(req.body.num_integrantes),
        endereco: req.body.endereco.trim(),
        telefone: req.body.telefone?.trim() || null,
      });

      res.status(201).json(familia);
    } catch (erro) {
      next(erro);
    }
  },

  async editarFamilia(req, res, next) {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({ mensagem: "ID de família inválido." });
      }

      validarFamilia(req.body);
      await familiaDAO.atualizar(req.params.id, req.body);
      res.json({ mensagem: "Família atualizada." });
    } catch (erro) {
      next(erro);
    }
  },

  async removerFamilia(req, res, next) {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({ mensagem: "ID de família inválido." });
      }

      await familiaDAO.excluir(req.params.id);
      res.json({ mensagem: "Família removida." });
    } catch (erro) {
      next(erro);
    }
  },

  async listarLotes(req, res, next) {
    try {
      res.json(await loteDAO.listarTodos());
    } catch (erro) {
      next(erro);
    }
  },

  async registrarDoacao(req, res, next) {
    try {
      const lotes = await estoqueService.registrarDoacao(req.body);
      res.status(201).json({ mensagem: "Doação registrada.", lotes });
    } catch (erro) {
      next(erro);
    }
  },

  async consultarEstoque(req, res, next) {
    try {
      const [produtos] = await pool.execute(
        `SELECT
           p.id_produto,
           p.nome,
           p.descricao,
           p.peso,
           p.categoria,
           COALESCE(SUM(l.qtd_atual), 0) AS quantidade
         FROM Produto AS p
         LEFT JOIN Lote AS l ON l.id_produto = p.id_produto
         GROUP BY p.id_produto, p.nome, p.descricao, p.peso, p.categoria
         ORDER BY p.nome`
      );

      const lotes = await loteDAO.listarTodos();
      const [vencendo] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM Lote
         WHERE qtd_atual > 0
           AND validade BETWEEN CURDATE()
           AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
      );

      res.json({
        produtos,
        lotes,
        estatisticas: {
          produtos: produtos.length,
          lotes: lotes.length,
          quantidade: produtos.reduce(
            (total, produto) => total + Number(produto.quantidade),
            0
          ),
          vencendo: Number(vencendo[0].total),
        },
      });
    } catch (erro) {
      next(erro);
    }
  },

  async listarEntregas(req, res, next) {
    try {
      res.json(await entregaDAO.listarTodas());
    } catch (erro) {
      next(erro);
    }
  },

  async historicoFamilia(req, res, next) {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({ mensagem: "ID de família inválido." });
      }

      res.json(await entregaDAO.listarHistoricoPorFamilia(req.params.id));
    } catch (erro) {
      next(erro);
    }
  },

  async registrarEntrega(req, res, next) {
    try {
      const entrega = await entregaService.registrar(req.body);
      res.status(201).json({ mensagem: "Entrega registrada.", entrega });
    } catch (erro) {
      next(erro);
    }
  },

  async dashboard(req, res, next) {
    try {
      const resumo = await relatorioDAO.resumo();
      const [movimentacoes] = await pool.execute(
        `SELECT tipo, descricao, data FROM (
           SELECT
             'Doação' AS tipo,
             CONCAT(l.qtd_inicial, ' unidades de ', p.nome) AS descricao,
             l.data_recebimento AS data
           FROM Lote AS l
           INNER JOIN Produto AS p ON p.id_produto = l.id_produto

           UNION ALL

           SELECT
             'Entrega' AS tipo,
             CONCAT('Família ', f.nome_responsavel) AS descricao,
             e.data_entrega AS data
           FROM Entrega_cesta AS e
           INNER JOIN Familia AS f ON f.id_familia = e.id_familia
         ) AS registros
         ORDER BY data DESC
         LIMIT 8`
      );

      res.json({ resumo, movimentacoes });
    } catch (erro) {
      next(erro);
    }
  },

  async lotesVencendo(req, res, next) {
    try {
      res.json(await relatorioDAO.lotesVencendo(30));
    } catch (erro) {
      next(erro);
    }
  },

  async doacoesPorDoador(req, res, next) {
    try {
      res.json(await relatorioDAO.doacoesPorDoador());
    } catch (erro) {
      next(erro);
    }
  },

  async doacoesPorMes(req, res, next) {
    try {
      res.json(await relatorioDAO.doacoesPorMes());
    } catch (erro) {
      next(erro);
    }
  },

  async familiasPorMes(req, res, next) {
    try {
      res.json(await relatorioDAO.familiasAtendidasPorMes());
    } catch (erro) {
      next(erro);
    }
  },
}; 
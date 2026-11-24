(() => {
  const form = document.getElementById("formEstoque");

  if (form) {
    iniciarCadastroDoacao(form);
  } else {
    iniciarConsultaEstoque();
  }

  async function iniciarCadastroDoacao(formulario) {
    const campoDoador = document.getElementById("doador");
    const campoData = document.getElementById("recebimento");
    const listaItens = document.getElementById("itens-doacao");
    const botaoAdicionar = document.getElementById("adicionar-item-doacao");

    const [doadores, produtos] = await Promise.all([
      BancoAuth.api("/doadores"),
      BancoAuth.api("/produtos"),
    ]);

    doadores.forEach((doador) => {
      const opcao = document.createElement("option");
      opcao.value = doador.id_doador;
      opcao.textContent = doador.nome;
      campoDoador.appendChild(opcao);
    });

    const hoje = new Date();
    campoData.value = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");

    function adicionarItem() {
      const linha = document.createElement("div");
      linha.className = "form-grid item-doacao";

      const select = document.createElement("select");
      select.className = "produto-doacao";
      select.required = true;

      const opcaoInicial = document.createElement("option");
      opcaoInicial.value = "";
      opcaoInicial.textContent = "Selecione o produto";
      select.appendChild(opcaoInicial);

      produtos.forEach((produto) => {
        const opcao = document.createElement("option");
        opcao.value = produto.id_produto;
        opcao.textContent = produto.nome;
        select.appendChild(opcao);
      });

      const quantidade = document.createElement("input");
      quantidade.type = "number";
      quantidade.className = "quantidade-doacao";
      quantidade.min = "1";
      quantidade.placeholder = "Quantidade";
      quantidade.required = true;

      const validade = document.createElement("input");
      validade.type = "date";
      validade.className = "validade-doacao";
      validade.required = true;

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "btn btn-secondary";
      remover.textContent = "Remover";
      remover.addEventListener("click", () => linha.remove());

      linha.append(select, quantidade, validade, remover);
      listaItens.appendChild(linha);
    }

    botaoAdicionar.addEventListener("click", adicionarItem);
    adicionarItem();

    formulario.addEventListener("submit", async (event) => {
      event.preventDefault();

      const itens = [...listaItens.querySelectorAll(".item-doacao")].map((linha) => ({
        id_produto: Number(linha.querySelector(".produto-doacao").value),
        quantidade: Number(linha.querySelector(".quantidade-doacao").value),
        validade: linha.querySelector(".validade-doacao").value,
      }));

      const botao = formulario.querySelector('[type="submit"]');

      try {
        botao.disabled = true;

        await BancoAuth.api("/lotes", {
          method: "POST",
          body: JSON.stringify({
            id_doador: Number(campoDoador.value),
            data_recebimento: campoData.value,
            itens,
          }),
        });

        alert("Doação registrada e estoque atualizado.");
        window.location.href = "estoque.html";
      } catch (erro) {
        alert(erro.message);
      } finally {
        botao.disabled = false;
      }
    });
  }

  async function iniciarConsultaEstoque() {
    const tabelas = document.querySelectorAll(".table-container tbody");
    if (tabelas.length < 2) return;

    const [campoProduto, campoLote] =
      document.querySelectorAll('.toolbar input[type="search"]');
    const filtroLote = document.querySelector(".toolbar select");
    const numeros = document.querySelectorAll(".stats .stat-number");

    let dados;

    try {
      dados = await BancoAuth.api("/estoque");
    } catch (erro) {
      alert("Não foi possível carregar o estoque: " + erro.message);
      return;
    }

    numeros[0].textContent = dados.estatisticas.produtos;
    numeros[1].textContent = dados.estatisticas.lotes;
    numeros[2].textContent = dados.estatisticas.quantidade;
    numeros[3].textContent = dados.estatisticas.vencendo;

    function desenharProdutos() {
      const termo = (campoProduto.value || "").toLowerCase();
      tabelas[0].replaceChildren();

      dados.produtos
        .filter((produto) => produto.nome.toLowerCase().includes(termo))
        .forEach((produto) => {
          const linha = document.createElement("tr");
          [
            produto.nome,
            produto.categoria,
            produto.quantidade,
            produto.peso ? `${produto.peso} kg/un.` : "Unidades",
            Number(produto.quantidade) > 0 ? "Disponível" : "Sem estoque",
          ].forEach((valor, indice) => {
            const celula = document.createElement("td");
            if (indice === 4) {
              const status = document.createElement("span");
              status.className = Number(produto.quantidade) > 0 ? "status" : "status danger";
              status.textContent = valor;
              celula.appendChild(status);
            } else {
              celula.textContent = valor ?? "—";
            }
            linha.appendChild(celula);
          });
          tabelas[0].appendChild(linha);
        });
    }

    function desenharLotes() {
      const termo = (campoLote.value || "").toLowerCase();
      const situacao = filtroLote.value.toLowerCase();
      tabelas[1].replaceChildren();

      dados.lotes
        .filter((lote) => {
          const correspondeTexto = [
            lote.id_lote,
            lote.produto,
            lote.doador,
          ].some((valor) => String(valor || "").toLowerCase().includes(termo));

          const validade = String(lote.validade).slice(0, 10);
          const dias = Math.ceil(
            (new Date(`${validade}T00:00:00`) - new Date()) / 86400000
          );

          const status =
            dias < 0
              ? "Vencido"
              : dias <= 30
                ? "Próximo do vencimento"
                : Number(lote.qtd_atual) > 0
                  ? "Disponível"
                  : "Sem estoque";

          const correspondeStatus =
            situacao.includes("todas") ||
            situacao.includes(status.toLowerCase());

          lote.statusTela = status;
          return correspondeTexto && correspondeStatus;
        })
        .forEach((lote) => {
          const linha = document.createElement("tr");
          const validade = String(lote.validade).slice(0, 10);
          const recebimento = String(lote.data_recebimento).slice(0, 10);

          [
            lote.id_lote,
            lote.produto,
            lote.doador,
            lote.qtd_inicial,
            lote.qtd_atual,
            new Date(`${recebimento}T00:00:00`).toLocaleDateString("pt-BR"),
            new Date(`${validade}T00:00:00`).toLocaleDateString("pt-BR"),
            lote.statusTela,
          ].forEach((valor, indice) => {
            const celula = document.createElement("td");

            if (indice === 7) {
              const status = document.createElement("span");
              status.className =
                valor === "Vencido"
                  ? "status danger"
                  : valor === "Próximo do vencimento"
                    ? "status warning"
                    : "status";
              status.textContent = valor;
              celula.appendChild(status);
            } else {
              celula.textContent = valor ?? "—";
            }

            linha.appendChild(celula);
          });

          tabelas[1].appendChild(linha);
        });
    }

    campoProduto.addEventListener("input", desenharProdutos);
    campoLote.addEventListener("input", desenharLotes);
    filtroLote.addEventListener("change", desenharLotes);
    desenharProdutos();
    desenharLotes();
  }
})();

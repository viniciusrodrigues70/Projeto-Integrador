(async () => {
  const form = document.getElementById("formEntrega");
  if (!form) return;

  const campoFamilia = document.getElementById("familia");
  const campoData = document.getElementById("data");
  const campoItens = document.getElementById("itens-entrega");
  const campoObservacao = document.getElementById("observacao");

  try {
    const [familias, produtos] = await Promise.all([
      BancoAuth.api("/familias"),
      BancoAuth.api("/produtos"),
    ]);

    campoFamilia.replaceChildren(new Option("Selecione a família", ""));

    familias.forEach((familia) => {
      campoFamilia.add(new Option(
        familia.nome_responsavel,
        familia.id_familia
      ));
    });

    const hoje = new Date();
    campoData.value = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");

    function adicionarItem() {
      const linha = document.createElement("div");
      linha.className = "form-grid item-entrega";

      const select = document.createElement("select");
      select.className = "produto-entrega";
      select.required = true;
      select.add(new Option("Selecione o produto", ""));

      produtos.forEach((produto) => {
        select.add(new Option(produto.nome, produto.id_produto));
      });

      const quantidade = document.createElement("input");
      quantidade.type = "number";
      quantidade.className = "quantidade-entrega";
      quantidade.min = "1";
      quantidade.placeholder = "Quantidade";
      quantidade.required = true;

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "btn btn-secondary";
      remover.textContent = "Remover";
      remover.addEventListener("click", () => linha.remove());

      linha.append(select, quantidade, remover);
      campoItens.appendChild(linha);
    }

    document
      .getElementById("adicionar-item-entrega")
      .addEventListener("click", adicionarItem);

    adicionarItem();

    campoFamilia.addEventListener("change", async () => {
      const familia = familias.find(
        (item) => String(item.id_familia) === campoFamilia.value
      );

      document.getElementById("info-responsavel").value =
        familia?.nome_responsavel || "";
      document.getElementById("info-integrantes").value =
        familia?.num_integrantes || "";

      if (familia) {
        const historico = await BancoAuth.api(
          `/entregas/familia/${familia.id_familia}`
        );
        document.getElementById("info-ultima-entrega").value =
          historico.length
            ? new Date(historico[0].data_entrega).toLocaleDateString("pt-BR")
            : "Sem entregas registradas";
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const itens = [...campoItens.querySelectorAll(".item-entrega")].map((linha) => ({
        id_produto: Number(linha.querySelector(".produto-entrega").value),
        quantidade: Number(linha.querySelector(".quantidade-entrega").value),
      }));

      const botao = form.querySelector('[type="submit"]');

      try {
        botao.disabled = true;

        await BancoAuth.api("/entregas", {
          method: "POST",
          body: JSON.stringify({
            id_familia: Number(campoFamilia.value),
            data_entrega: campoData.value,
            observacao: campoObservacao.value.trim(),
            itens,
          }),
        });

        alert("Entrega registrada e estoque atualizado.");
        window.location.href = "entregas.html";
      } catch (erro) {
        alert(erro.message);
      } finally {
        botao.disabled = false;
      }
    });
  } catch (erro) {
    alert("Não foi possível preparar o formulário: " + erro.message);
  }
})();

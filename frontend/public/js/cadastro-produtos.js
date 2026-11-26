
(function () {
    const form = document.getElementById("formProduto");

    if (!form) {
        return;
    }

    const status = document.createElement("div");
    const quantidade = form.elements.quantidade;
    const doador = form.elements.id_doador;
    const validade = form.elements.validade;

    status.className = "auth-message";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    form.prepend(status);

    function atualizarCamposDoEstoque() {
        const precisaEstoque = Number(quantidade.value) > 0;
        doador.required = precisaEstoque;
        validade.required = precisaEstoque;
    }

    const hoje = new Date();
    validade.min = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    quantidade.addEventListener("input", atualizarCamposDoEstoque);
    atualizarCamposDoEstoque();

    BancoAuth.api("/doadores").then(function (doadores) {
        for (const registro of doadores) {
            const opcao = document.createElement("option");
            opcao.value = registro.id_doador;
            opcao.textContent = registro.nome;
            doador.appendChild(opcao);
        }
    }).catch(function () {
        BancoAuth.mensagem(status, "Não foi possível carregar os doadores.", true);
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const botao = form.querySelector('[type="submit"]');
        botao.disabled = true;

        try {
            const payload = {
                nome: form.elements.nome.value.trim(),
                descricao: form.elements.descricao.value.trim(),
                peso: null,
                categoria: form.elements.categoria.value,
                quantidade: Number(quantidade.value)
            };

            if (form.elements.peso.value) {
                payload.peso = Number(form.elements.peso.value);
            }

            if (payload.quantidade > 0) {
                payload.id_doador = Number(doador.value);
                payload.validade = validade.value;
            }

            const resposta = await BancoAuth.api("/produtos", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            BancoAuth.mensagem(
                status,
                resposta.mensagem || "Produto cadastrado."
            );

            window.setTimeout(function () {
                window.location.href = "produtos.html";
            }, 500);

        } catch (error) {
            BancoAuth.mensagem(status, error.message, true);

        } finally {
            botao.disabled = false;
        }
    });
})();


(function () {
    const form = document.getElementById("formProduto");

    if (!form) {
        return;
    }

    const status = document.createElement("div");

    status.className = "auth-message";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    form.prepend(status);

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
                quantidade: 0
            };

            if (form.elements.peso.value) {
                payload.peso = Number(form.elements.peso.value);
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
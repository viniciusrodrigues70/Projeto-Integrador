
(function () {
    const form = document.getElementById("formFamilia");

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
            const resposta = await BancoAuth.api("/familias", {
                method: "POST",
                body: JSON.stringify({
                    nome_responsavel: form.elements.responsavel.value.trim(),
                    cpf_responsavel: form.elements.cpf.value,
                    num_integrantes: Number(form.elements.integrantes.value),
                    telefone: form.elements.telefone.value.trim() || null,
                    endereco: form.elements.endereco.value.trim()
                })
            });

            BancoAuth.mensagem(
                status,
                resposta.mensagem || "Família cadastrada."
            );

            window.setTimeout(function () {
                window.location.href = "familias.html";
            }, 500);

        } catch (error) {
            BancoAuth.mensagem(status, error.message, true);

        } finally {
            botao.disabled = false;
        }
    });
})();
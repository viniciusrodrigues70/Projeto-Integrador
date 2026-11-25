(function () {
    const form = document.getElementById("formDoador");

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
            const dados = Object.fromEntries(new FormData(form));
                delete dados.confirmacao;

            const resposta = await BancoAuth.api("/doadores", {
                method: "POST",
                body: JSON.stringify(dados)
            });

            BancoAuth.mensagem(
                status,
                resposta.mensagem || "Doador cadastrado."
            );

            window.setTimeout(function () {
                window.location.href = "doadores.html";
            }, 500);

        } catch (error) {
            BancoAuth.mensagem(status, error.message, true);

        } finally {
            botao.disabled = false;
        }
    });
})();
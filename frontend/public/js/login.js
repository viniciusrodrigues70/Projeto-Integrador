document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = document.getElementById("mensagem");
    const button = form.querySelector("button");

    button.disabled = true;

    try {
        const data = await BancoAuth.api("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: form.email.value,
                senha: form.senha.value
            })
        });

        BancoAuth.salvarSessao(data);

        window.location.href = "dashboard.html";

    } catch (error) {
        BancoAuth.mensagem(status, error.message, true);

    } finally {
        button.disabled = false;
    }
});
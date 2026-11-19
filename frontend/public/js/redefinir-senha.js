document.getElementById("redefinir-form").addEventListener("submit", async (event) => {
    event.preventDefault();


    const form = event.currentTarget;
    const status = document.getElementById("mensagem");
    const button = form.querySelector("button");
    const token = new URLSearchParams(location.search).get("token");


    if (form.senha.value !== form.confirmarSenha.value) {
        BancoAuth.mensagem(status, "As senhas não coincidem.", true);
        return;
    }


    if (!token) {
        BancoAuth.mensagem(status, "O link está incompleto. Solicite outra redefinição.", true);
        return;
    }


    button.disabled = true;


    try {
        const data = await BancoAuth.api("/auth/redefinir-senha", {
            method: "POST",
            body: JSON.stringify({
                token,
                senha: form.senha.value
            })
        });


        BancoAuth.mensagem(status, data.mensagem);
        form.reset();


        history.replaceState(null, "", location.pathname);


    } catch (error) {
        BancoAuth.mensagem(status, error.message, true);


    } finally {
        button.disabled = false;
    }
});

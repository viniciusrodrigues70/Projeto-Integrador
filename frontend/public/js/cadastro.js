
document.getElementById("cadastro-form").addEventListener("submit", async (event) => {
    event.preventDefault();


    const form = event.currentTarget;
    const status = document.getElementById("mensagem");
    const button = form.querySelector("button");


    if (form.senha.value !== form.confirmarSenha.value) {
        BancoAuth.mensagem(status, "As senhas não coincidem.", true);
        return;
    }


    button.disabled = true;


    try {
        const data = await BancoAuth.api("/auth/cadastro", {
            method: "POST",
            body: JSON.stringify({
                nome: form.nome.value,
                email: form.email.value,
                senha: form.senha.value
            })
        });


        BancoAuth.mensagem(status, data.mensagem);
        form.reset();


    } catch (error) {
        BancoAuth.mensagem(status, error.message, true);


    } finally {
        button.disabled = false;
    }
});

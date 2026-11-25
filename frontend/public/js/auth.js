(function () {
    const API_HOST = window.location.hostname || "localhost";
    const API_BASE = `http://${API_HOST}:3000/api`;

    const USER_KEY = "bancoSolidarioUsuario";
    const LOGIN_KEY = "bancoSolidarioLogado";

    function obterCookie(nome) {
        const cookies = document.cookie.split(";");
        const procurado = nome + "=";

        for (const item of cookies) {
            const cookie = item.trim();

            if (cookie.startsWith(procurado)) {
                const valor = cookie.slice(procurado.length);

                return decodeURIComponent(valor);
            }
        }

        return null;
    }

    function salvarCookie(nome, valor) {
        let seguro = "";

        if (window.location.protocol === "https:") {
            seguro = "; Secure";
        }

        document.cookie = `${nome}=${encodeURIComponent(valor)}; Max-Age=28800; Path=/; SameSite=Lax${seguro}`;
    }

    function limparSessao() {
        let seguro = "";

        if (window.location.protocol === "https:") {
            seguro = "; Secure";
        }

        document.cookie = `${USER_KEY}=; Max-Age=0; Path=/; SameSite=Lax${seguro}`;
        document.cookie = `${LOGIN_KEY}=; Max-Age=0; Path=/; SameSite=Lax${seguro}`;
    }

    async function api(path, options = {}) {
        const headers = {
            "Content-Type": "application/json"
        };

        if (options.headers) {
            Object.assign(headers, options.headers);
        }

        const response = await fetch(API_BASE + path, {
            ...options,
            credentials: "include",
            headers: headers
        });

        const data = await response.json().catch(function () {
            return {};
        });

        if (!response.ok) {
            throw new Error(
                data.mensagem || "Não foi possível concluir a solicitação."
            );
        }

        return data;
    }

    function mensagem(element, texto, erro = false) {
        if (!element) {
            return;
        }

        element.textContent = texto;
        element.hidden = !texto;

        element.classList.toggle("error", erro);
        element.classList.toggle("success", !erro);
    }

    function salvarSessao(data) {
        const usuario = JSON.stringify(data.usuario);

        salvarCookie(USER_KEY, usuario);
        salvarCookie(LOGIN_KEY, "true");
    }

    function adicionarControlesDeSenha() {
        const olho = `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;

        const olhoFechado = `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m3 3 18 18"></path>
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8"></path>
                <path d="M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"></path>
            </svg>
        `;

        const campos = document.querySelectorAll('input[type="password"]');

        for (const input of campos) {
            const campo = document.createElement("div");

            campo.className = "password-field";

            input.parentNode.insertBefore(campo, input);
            campo.appendChild(input);

            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "password-toggle";
            botao.setAttribute("aria-label", "Mostrar senha");
            botao.setAttribute("aria-pressed", "false");
            botao.title = "Mostrar senha";
            botao.innerHTML = olho;

            botao.addEventListener("click", function () {
                let mostrar = false;

                if (input.type === "password") {
                    input.type = "text";
                    mostrar = true;
                } else {
                    input.type = "password";
                }

                if (mostrar) {
                    botao.setAttribute("aria-label", "Ocultar senha");
                    botao.title = "Ocultar senha";
                    botao.innerHTML = olhoFechado;
                } else {
                    botao.setAttribute("aria-label", "Mostrar senha");
                    botao.title = "Mostrar senha";
                    botao.innerHTML = olho;
                }

                botao.setAttribute("aria-pressed", String(mostrar));

                input.focus();
            });

            campo.appendChild(botao);
        }
    }

    function atualizarPerfil(usuario) {
        const perfil = document.querySelector(".profile");

        if (!perfil || !usuario) {
            return;
        }

        const avatar = perfil.querySelector(".avatar");
        const nome = perfil.querySelector("strong");
        const tipo = perfil.querySelector("small");

        const nomeUsuario = String(usuario.nome || "Usuário").trim();
        const partesNome = nomeUsuario.split(/\s+/);

        let iniciais = "";

        for (let i = 0; i < partesNome.length && i < 2; i++) {
            iniciais += partesNome[i][0];
        }

        iniciais = iniciais.toUpperCase();

        const tipos = {
            ADMINISTRADOR: "Administrador",
            OPERADOR: "Operador"
        };

        if (avatar) {
            avatar.textContent = iniciais || "US";
        }

        if (nome) {
            nome.textContent = usuario.nome || "Usuário";
        }

        if (tipo) {
            tipo.textContent = usuario.email || "";

            perfil.title = usuario.perfil || tipos[usuario.tipo] || usuario.tipo || "Conta";
        }
    }

    async function sair() {
        try {
            await api("/auth/logout", {
                method: "POST"
            });
        } catch (erro) {
        }

        limparSessao();

        window.location.href = "login.html";
    }

    adicionarControlesDeSenha();

    window.BancoAuth = {
        api: api,
        mensagem: mensagem,
        salvarSessao: salvarSessao,
        USER_KEY: USER_KEY,
        sair: sair
    };

    const botoesSair = document.querySelectorAll(".auth-logout");

    for (const botao of botoesSair) {
        botao.addEventListener("click", function (event) {
            event.preventDefault();
            sair();
        });
    }

    if (document.body.classList.contains("auth-protected")) {
        const logado = obterCookie(LOGIN_KEY);

        if (logado !== "true") {
            window.location.replace("login.html");
            return;
        }

        try {
            const cookieUsuario = obterCookie(USER_KEY);
            const usuarioSalvo = JSON.parse(cookieUsuario || "null");

            atualizarPerfil(usuarioSalvo);

        } catch (erro) {
        }

        api("/auth/me")
            .then(function (data) {
                const usuario = JSON.stringify(data.usuario);

                salvarCookie(USER_KEY, usuario);
                atualizarPerfil(data.usuario);
            })
            .catch(function (erro) {
                limparSessao();

                window.location.replace("login.html");
            });
    }
})();
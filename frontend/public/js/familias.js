<<<<<<< HEAD

(function () {
    const tbody = document.querySelector(".table-container tbody");

    if (!tbody) {
        return;
    }

    tbody.replaceChildren();

    const aviso = document.createElement("div");

    aviso.className = "notice";

    const painel = tbody.closest(".panel");
    const tabela = tbody.closest(".table-container");

    painel?.insertBefore(aviso, tabela);

    async function carregar() {
        try {
            const familias = await BancoAuth.api("/familias");

            tbody.replaceChildren();

            for (const familia of familias) {
                const linha = document.createElement("tr");

                const valores = [
                    familia.id_familia,
                    familia.nome_responsavel,
                    familia.cpf_responsavel,
                    familia.num_integrantes,
                    familia.telefone ?? "—",
                    familia.endereco
                ];

                for (const valor of valores) {
                    const celula = document.createElement("td");

                    celula.textContent = String(valor ?? "—");

                    linha.appendChild(celula);
                }

                const colunaAcao = document.createElement("td");
                const botao = document.createElement("button");

                botao.type = "button";
                botao.className = "btn btn-secondary";
                botao.textContent = "Ver histórico";

                botao.addEventListener("click", function () {
                    mostrarHistorico(familia);
                });

                colunaAcao.appendChild(botao);
                linha.appendChild(colunaAcao);

                tbody.appendChild(linha);
            }

            aviso.hidden = true;

            if (familias.length === 0) {
                const linha = document.createElement("tr");

                linha.innerHTML = `
                    <td colspan="7" class="empty-state">
                        Nenhuma família cadastrada.
                    </td>
                `;

                tbody.appendChild(linha);
            }

        } catch (error) {
            aviso.textContent = `Não foi possível carregar as famílias: ${error.message}`;
            aviso.hidden = false;
        }
    }

    async function mostrarHistorico(familia) {
        const dialog = document.createElement("dialog");

        dialog.style.cssText = "width:min(760px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";

        const cabecalho = document.createElement("div");
        cabecalho.className = "panel-header";

        const titulo = document.createElement("h2");
        titulo.textContent = `Entregas de ${familia.nome_responsavel}`;

        const fechar = document.createElement("button");

        fechar.className = "btn btn-secondary";
        fechar.type = "button";
        fechar.textContent = "Fechar";

        fechar.addEventListener("click", function () {
            dialog.close();
        });

        cabecalho.append(titulo, fechar);

        const mensagem = document.createElement("p");
        mensagem.textContent = "Carregando histórico…";

        dialog.append(cabecalho, mensagem);

        document.body.appendChild(dialog);

        dialog.addEventListener("close", function () {
            dialog.remove();
        }, { once: true });

        dialog.showModal();

        try {
            const entregas = await BancoAuth.api(
                `/entregas/familia/${familia.id_familia}/historico`
            );

            if (entregas.length > 0) {
                const historico = [];

                for (const entrega of entregas) {
                    let texto = String(entrega.data_entrega).slice(0, 10);

                    texto += " — ";
                    texto += entrega.itens || "Itens não detalhados";

                    if (entrega.observacao) {
                        texto += ` — ${entrega.observacao}`;
                    }

                    historico.push(texto);
                }

                mensagem.textContent = historico.join("\n");

            } else {
                mensagem.textContent = "Nenhuma entrega registrada para esta família.";
            }

            mensagem.style.whiteSpace = "pre-line";

        } catch (error) {
            mensagem.textContent = `Não foi possível carregar o histórico: ${error.message}`;
        }
    }

    carregar();
})();
=======
(async () => {
  const tabela = document.querySelector(".table-container tbody");
  if (!tabela) return;

  try {
    const familias = await BancoAuth.api("/familias");
    tabela.replaceChildren();

    familias.forEach((familia) => {
      const linha = document.createElement("tr");

      [
        familia.id_familia,
        familia.nome_responsavel,
        familia.cpf_responsavel,
        familia.num_integrantes,
        familia.telefone || "—",
        familia.endereco,
      ].forEach((valor) => {
        const celula = document.createElement("td");
        celula.textContent = valor ?? "—";
        linha.appendChild(celula);
      });

      const celulaHistorico = document.createElement("td");
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "btn btn-light";
      botao.textContent = "Consultar";
      botao.addEventListener("click", async () => {
        try {
          const entregas = await BancoAuth.api(
            `/entregas/familia/${familia.id_familia}`
          );

          alert(
            entregas.length
              ? entregas
                  .map((e) => {
                    const data = String(e.data_entrega).slice(0, 10);
                    return `${new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")} — ${e.itens || "Entrega registrada"}`;
                  })
                  .join("\n")
              : "Essa família ainda não tem entregas registradas."
          );
        } catch (erro) {
          alert(erro.message);
        }
      });

      celulaHistorico.appendChild(botao);
      linha.appendChild(celulaHistorico);
      tabela.appendChild(linha);
    });

    const numeros = document.querySelectorAll(".stats .stat-number");
    if (numeros[0]) numeros[0].textContent = String(familias.length);
  } catch (erro) {
    alert("Não foi possível carregar as famílias: " + erro.message);
  }
})();
>>>>>>> f3023f5377c6b05559cd679ab40c95c33d6576cc

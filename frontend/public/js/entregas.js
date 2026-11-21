(() => {
  const API_PATH = "/entregas";
  const tbody = document.querySelector(".table-container tbody");
  if (!tbody) return;

  const busca = document.querySelector('.toolbar input[type="search"]');
  const periodo = document.querySelector(".toolbar select");
  const numeros = document.querySelectorAll(".stats .card .stat-number");
  const panel = tbody.closest(".panel");
  let entregas = Array.from(tbody.rows).map((row) => ({
    id_entrega: row.cells[0]?.textContent.trim(),
    familia: row.cells[1]?.textContent.trim(),
    data_entrega: row.cells[2]?.textContent.trim(),
    produto: row.cells[3]?.textContent.trim(),
    quantidade: row.cells[4]?.textContent.trim(),
    observacao: row.cells[5]?.textContent.trim(),
    situacao: row.cells[6]?.textContent.trim()
  }));

  function normalizar(valor) {
    return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function dataPartes(valor) {
    const texto = String(valor || "").slice(0, 10);
    let m = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return { ano: Number(m[1]), mes: Number(m[2]) };
    m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return { ano: Number(m[3]), mes: Number(m[2]) };
    return null;
  }
  function periodoSelecionado() {
    const texto = normalizar(periodo?.selectedOptions[0]?.textContent);
    if (!texto || texto.includes("todos")) return null;
    const m = texto.match(/^([a-z]+)\/(\d{4})$/);
    if (!m) return null;
    const meses = ["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    return { mes: meses.indexOf(m[1]) + 1, ano: Number(m[2]) };
  }
  function exibirAviso(texto) {
    let aviso = document.getElementById("entregas-aviso");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "entregas-aviso";
      aviso.className = "notice";
      panel.insertBefore(aviso, panel.querySelector(".table-container"));
    }
    aviso.textContent = texto;
    aviso.hidden = !texto;
  }
  function desenhar() {
    const termo = normalizar(busca?.value), filtroPeriodo = periodoSelecionado();
    const filtradas = entregas.filter((e) => {
      const correspondeTexto = [e.familia, e.produto, e.observacao].some((v) => normalizar(v).includes(termo));
      const d = dataPartes(e.data_entrega);
      const correspondePeriodo = !filtroPeriodo || (d && d.mes === filtroPeriodo.mes && d.ano === filtroPeriodo.ano);
      return correspondeTexto && correspondePeriodo;
    });
    tbody.replaceChildren();
    if (!filtradas.length) {
      const tr = document.createElement("tr"), td = document.createElement("td");
      td.colSpan = 7; td.className = "empty-state"; td.textContent = "Nenhuma entrega corresponde aos filtros.";
      tr.appendChild(td); tbody.appendChild(tr);
    } else filtradas.forEach((e, index) => {
      const tr = document.createElement("tr");
      [e.id_entrega ?? index + 1, e.familia, e.data_entrega, e.produto, e.quantidade, e.observacao, e.situacao || "Concluída"].forEach((valor, coluna) => {
        const td = document.createElement("td");
        if (coluna === 6) { const status = document.createElement("span"); status.className = "status"; status.textContent = String(valor || "Concluída"); td.appendChild(status); }
        else td.textContent = String(valor ?? "—");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    if (numeros[0]) numeros[0].textContent = String(filtradas.length);
    if (numeros[1]) numeros[1].textContent = String(new Set(filtradas.map((e) => e.familia).filter(Boolean)).size);
  }
  async function carregar() {
    try {
      const resposta = await BancoAuth.api(API_PATH);
      const lista = Array.isArray(resposta) ? resposta : resposta.entregas;
      if (!Array.isArray(lista)) throw new Error("A API retornou uma lista inválida.");
      entregas = lista.map((e) => ({
        id_entrega: e.id_entrega ?? e.id,
        familia: e.familia ?? e.nome_responsavel ?? e.nome_familia ?? "Família",
        data_entrega: e.data_entrega ?? e.data,
        produto: e.produto ?? e.produtos ?? "—",
        quantidade: e.quantidade ?? "—",
        observacao: e.observacao ?? "—",
        situacao: e.situacao ?? "Concluída"
      }));
      exibirAviso("");
      desenhar();
    } catch (_) {
      exibirAviso("A API de entregas ainda não respondeu. Busca e filtro continuam disponíveis para os registros exibidos.");
    }
  }
  function abrirCadastro() {
    const dialog = document.createElement("dialog");
    dialog.style.cssText = "width:min(520px,calc(100% - 32px));border:0;border-radius:12px;padding:24px;box-shadow:0 20px 60px #0003;color:var(--text)";
    dialog.innerHTML = `
      <form method="dialog" class="panel-header"><div><h2>Registrar entrega</h2><p>Informe a família e os detalhes da entrega.</p></div><button class="btn btn-secondary" aria-label="Fechar">Fechar</button></form>
      <form id="nova-entrega" class="form-grid">
        <div class="form-group"><label for="entrega-familia">ID da família</label><input id="entrega-familia" name="id_familia" type="number" min="1" required></div>
        <div class="form-group"><label for="entrega-data">Data</label><input id="entrega-data" name="data_entrega" type="date" required></div>
        <div class="form-group full"><label for="entrega-observacao">Observação</label><textarea id="entrega-observacao" name="observacao" maxlength="255" placeholder="Detalhes opcionais"></textarea></div>
        <div class="form-group full" id="entrega-form-aviso" role="status" aria-live="polite"></div>
        <div class="form-group full form-actions"><button type="button" class="btn btn-secondary" data-cancelar>Cancelar</button><button class="btn" type="submit">Salvar entrega</button></div>
      </form>`;
    document.body.appendChild(dialog);
    const hoje = new Date();
    dialog.querySelector("#entrega-data").value = [hoje.getFullYear(), String(hoje.getMonth() + 1).padStart(2, "0"), String(hoje.getDate()).padStart(2, "0")].join("-");
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.querySelector('[data-cancelar]').addEventListener("click", () => dialog.close());
    dialog.querySelector("#nova-entrega").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget, botao = form.querySelector('[type="submit"]'), aviso = dialog.querySelector("#entrega-form-aviso");
      botao.disabled = true;
      try {
        await BancoAuth.api(API_PATH, { method: "POST", body: JSON.stringify({
          id_familia: Number(form.elements.id_familia.value),
          data_entrega: form.elements.data_entrega.value,
          observacao: form.elements.observacao.value.trim()
        }) });
        dialog.close();
        await carregar();
      } catch (error) {
        aviso.className = "auth-message error";
        aviso.textContent = error.message || "Não foi possível registrar a entrega.";
      } finally { botao.disabled = false; }
    });
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.showModal();
  }

  busca?.addEventListener("input", desenhar);
  periodo?.addEventListener("change", desenhar);
  document.querySelector('a[href*="cadastro-entregas"]')?.addEventListener("click", (event) => { event.preventDefault(); abrirCadastro(); });
  desenhar();
  carregar();
})();
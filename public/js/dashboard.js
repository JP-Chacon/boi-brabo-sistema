(() => {
  const API_BASE_URL =
    typeof window.resolveApiBaseUrl === "function"
      ? window.resolveApiBaseUrl()
      : window.location.origin && window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost:3000";
  const TOKEN_KEY = "token";
  const TOKEN_EXPIRES_KEY = "token_expires_at";
  const USER_KEY = "user";
  if (window.dayjs && window.dayjs_plugin_relativeTime) {
    window.dayjs.extend(window.dayjs_plugin_relativeTime);
    window.dayjs.locale("pt-br");
  }

  const sidebar = document.getElementById("saasSidebar");
  const backdrop = document.getElementById("saasBackdrop");
  const sidebarOpenBtn = document.getElementById("saasSidebarOpen");
  const sidebarCloseBtn = document.getElementById("saasSidebarClose");
  const logoutBtn = document.getElementById("saasLogout");
  const topLogoutBtn = document.getElementById("saasTopLogout");
  const viewAllActivitiesBtn = document.getElementById("viewAllActivities");

  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");
  const currentDate = document.getElementById("currentDate");
  const globalMsg = document.getElementById("globalMsg");
  const userAvatarEl = document.getElementById("userAvatar");
  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");

  const pages = Array.from(document.querySelectorAll(".saas-page"));
  const navItems = Array.from(document.querySelectorAll(".saas-nav-item"));
  const usuariosNavItem = document.getElementById("menu-usuarios");
  const organizacaoNavItem = document.getElementById("menu-organizacao");
  const unidadesNavItem = document.getElementById("menu-unidades");

  // Stats
  const statColaboradores = document.getElementById("statColaboradores");
  const statEquipamentos = document.getElementById("statEquipamentos");
  const statDisponiveis = document.getElementById("statDisponiveis");
  const statAtribuidos = document.getElementById("statAtribuidos");
  const statAguardando = document.getElementById("statAguardando");

  // Activities
  const activityList = document.getElementById("activityList");

  // Forms / Tables
  const colaboradorForm = document.getElementById("colaboradorForm");
  const equipamentoForm = document.getElementById("equipamentoForm");
  const atribuirForm = document.getElementById("atribuirForm");

  const colaboradoresTbody = document.querySelector("#colaboradoresTable tbody");
  const equipamentosTbody = document.querySelector("#equipamentosTable tbody");
  const atribuicoesTbody = document.querySelector("#atribuicoesTable tbody");
  const usuariosTbody = document.querySelector("#usuariosTable tbody");
  const organizacaoTbody = document.querySelector("#organizacaoTable tbody");
  const unidadesTbody = document.querySelector("#unidadesTable tbody");
  const colaboradoresTableWrap = document.getElementById("colaboradoresTableWrap");
  const equipamentosTableWrap = document.getElementById("equipamentosTableWrap");
  const atribuicoesTableWrap = document.getElementById("atribuicoesTableWrap");
  const usuariosTableWrap = document.getElementById("usuariosTableWrap");
  const organizacaoTableWrap = document.getElementById("organizacaoTableWrap");
  const organizacaoNewDepartamentoBtn = document.getElementById("organizacaoNewDepartamentoBtn");
  const unidadesNewBtn = document.getElementById("unidadesNewBtn");
  const unidadeCreateModal = document.getElementById("unidadeCreateModal");
  const unidadeCreateForm = document.getElementById("unidadeCreateForm");
  const unidadeCreateNomeEmpresa = document.getElementById("unidadeCreateNomeEmpresa");
  const unidadeCreateTipo = document.getElementById("unidadeCreateTipo");
  const unidadeCreateEstado = document.getElementById("unidadeCreateEstado");
  const unidadeCreateCidade = document.getElementById("unidadeCreateCidade");
  const unidadeCreateAtivo = document.getElementById("unidadeCreateAtivo");
  const unidadeCreateBtnCancel = document.getElementById("unidadeCreateBtnCancel");
  const unidadeCreateBtnSubmit = document.getElementById("unidadeCreateBtnSubmit");
  const unidadeCreateModalClose = document.getElementById("unidadeCreateModalClose");
  const globalDropdown = document.getElementById("globalDropdown");

  let globalDropdownAnchor = null;
  let globalDropdownContext = null;

  const colaboradoresSearch = document.getElementById("colaboradoresSearch");
  const colaboradoresDepartamentoFilter = document.getElementById("colaboradoresDepartamentoFilter");
  const colaboradoresCargoFilter = document.getElementById("colaboradoresCargoFilter");
  const colaboradoresClearFiltersBtn = document.getElementById("colaboradoresClearFiltersBtn");
  const colaboradoresActiveFilters = document.getElementById("colaboradoresActiveFilters");
  const colaboradoresResultsCount = document.getElementById("colaboradoresResultsCount");
  const colaboradoresActiveFilterTags = document.getElementById("colaboradoresActiveFilterTags");
  const colaboradorNewBtn = document.getElementById("colaboradorNewBtn");
  const colaboradorFormPanel = document.getElementById("colaboradorFormPanel");
  const colaboradoresPrevBtn = document.getElementById("colaboradoresPrevBtn");
  const colaboradoresNextBtn = document.getElementById("colaboradoresNextBtn");
  const colaboradoresPageInfo = document.getElementById("colaboradoresPageInfo");
  const colaboradoresMetricTotal = document.getElementById("colaboradoresMetricTotal");
  const colaboradoresMetricDepartamentos = document.getElementById(
    "colaboradoresMetricDepartamentos"
  );
  const colaboradoresMetricCargos = document.getElementById("colaboradoresMetricCargos");

  const eqBusca = document.getElementById("eq_busca_codigo_barras");
  const equipamentosSituacaoFilter = document.getElementById("equipamentosSituacaoFilter");
  const equipamentosDisponibilidadeFilter = document.getElementById("equipamentosDisponibilidadeFilter");
  const equipamentosClearFiltersBtn = document.getElementById("equipamentosClearFiltersBtn");
  const equipamentosActiveFilters = document.getElementById("equipamentosActiveFilters");
  const equipamentosResultsCount = document.getElementById("equipamentosResultsCount");
  const equipamentosActiveFilterTags = document.getElementById("equipamentosActiveFilterTags");
  const equipamentoNewBtn = document.getElementById("equipamentoNewBtn");
  const equipamentoFormPanel = document.getElementById("equipamentoFormPanel");
  const equipamentoIdInput = document.getElementById("eq_id");
  const equipamentoDrawerTitle = document.getElementById("equipamentoDrawerTitle");
  const equipamentoDrawerSubtitle = document.getElementById("equipamentoDrawerSubtitle");
  const equipamentoSubmitBtn = document.getElementById("equipamentoSubmitBtn");
  const equipamentoValorInput = document.getElementById("eq_valor");
  const equipamentosPrevBtn = document.getElementById("equipamentosPrevBtn");
  const equipamentosNextBtn = document.getElementById("equipamentosNextBtn");
  const equipamentosPageInfo = document.getElementById("equipamentosPageInfo");
  const equipamentosMetricTotal = document.getElementById("equipamentosMetricTotal");
  const equipamentosMetricDisponiveis = document.getElementById("equipamentosMetricDisponiveis");
  const equipamentosMetricEmUso = document.getElementById("equipamentosMetricEmUso");

  const atribuicoesSearch = document.getElementById("atribuicoesSearch");
  const atribuicoesStatusFilter = document.getElementById("atribuicoesStatusFilter");
  const atribuicoesDataInicial = document.getElementById("atribuicoesDataInicial");
  const atribuicoesDataFinal = document.getElementById("atribuicoesDataFinal");
  const atribuicoesClearFiltersBtn = document.getElementById("atribuicoesClearFiltersBtn");
  const atribuicoesActiveFilters = document.getElementById("atribuicoesActiveFilters");
  const atribuicoesResultsCount = document.getElementById("atribuicoesResultsCount");
  const atribuicoesActiveFilterTags = document.getElementById("atribuicoesActiveFilterTags");
  const atribuicaoNewBtn = document.getElementById("atribuicaoNewBtn");
  const atribuicaoFormPanel = document.getElementById("atribuicaoFormPanel");
  const atribuicoesPrevBtn = document.getElementById("atribuicoesPrevBtn");
  const atribuicoesNextBtn = document.getElementById("atribuicoesNextBtn");
  const atribuicoesPageInfo = document.getElementById("atribuicoesPageInfo");
  const atribColaborador = document.getElementById("atrib_colaborador");
  const atribEquipamento = document.getElementById("atrib_equipamento");
  const atribEquipamentoList = document.getElementById("atrib_equipamento_list");
  const atribEquipamentoTags = document.getElementById("atrib_equipamento_tags");
  const atribEquipamentoSelectedWrap = document.getElementById("atrib_equipamento_selected_wrap");
  const atribEquipamentoPlaceholder = document.getElementById("atrib_equipamento_placeholder");
  const atribEquipamentoPicker = document.getElementById("atrib_equipamento_picker");
  const atribuicoesMetricAtivas = document.getElementById("atribuicoesMetricAtivas");
  const atribuicoesMetricColaboradores = document.getElementById("atribuicoesMetricColaboradores");
  const atribuicoesMetricDisponiveis = document.getElementById("atribuicoesMetricDisponiveis");
  const relatorioTotalInvestidoEl = document.getElementById("relatorioTotalInvestido");
  const relatorioValorEmUsoEl = document.getElementById("relatorioValorEmUso");
  const relatorioValorDisponivelEl = document.getElementById("relatorioValorDisponivel");
  const relatorioChartDepartamentosEl = document.getElementById("relatorioChartDepartamentos");
  const relatorioChartStatusEl = document.getElementById("relatorioChartStatus");

  let colaboradoresCache = [];
  let equipamentosCache = [];
  let atribuicoesCache = [];
  const dashboardForms = [colaboradorForm, equipamentoForm, atribuirForm].filter(Boolean);
  const colaboradoresPageSize = 5;
  const equipamentosPageSize = 5;
  const atribuicoesPageSize = 5;
  let colaboradoresCurrentPage = 1;
  let equipamentosCurrentPage = 1;
  let atribuicoesCurrentPage = 1;
  let colaboradoresTotalPages = 1;
  let equipamentosTotalPages = 1;
  let atribuicoesTotalPages = 1;
  let colaboradoresResultsTotal = 0;
  let equipamentosResultsTotal = 0;
  let atribuicoesResultsTotal = 0;
  let colaboradoresFilterTimer = null;
  let equipamentosFilterTimer = null;
  let atribuicoesFilterTimer = null;
  const pendingRowHighlight = {
    colaboradores: null,
    equipamentos: null,
    atribuicoes: null,
    organizacao: null,
    unidades: null,
  };
  let chartRelatorioDept = null;
  let chartRelatorioStatus = null;
  let relatoriosDataCache = null;
  let relatoriosThemeObserver = null;
  let currentPage = "dashboard";
  const PAGE_TRANSITION_MS = 260;
  const LIST_TRANSITION_MS = 220;
  let isPageTransitioning = false;
  let queuedPage = null;
  let isApplyingUrlState = false;
  const VALID_PAGE_NAMES = new Set([
    "dashboard",
    "colaboradores",
    "equipamentos",
    "atribuicoes",
    "relatorios",
    "organizacao",
    "unidades",
    "usuarios",
  ]);

  let departamentosCache = [];
  let cargosCache = [];
  let unidadesCache = [];
  let pendingCargoHighlightId = null;

  /** Nome fixo da empresa nas unidades (não editável no fluxo de criação) */
  const UNIDADE_EMPRESA_NOME = "Boi Brabo";

  /** IBGE — localidades (estados e municípios por UF) */
  const IBGE_LOCALIDADES_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
  const IBGE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const IBGE_LS_ESTADOS = "ibge_estados_v1";
  const ibgeMunicipiosKey = (uf) => `ibge_municipios_${String(uf || "").toUpperCase()}_v1`;

  const ibgeMemory = { estados: null, municipios: new Map() };
  let ibgeEstadosPopulated = false;
  let ibgeEstadosLoading = null;

  function readIbgeCache(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.t !== "number" || parsed.d == null) return null;
      if (Date.now() - parsed.t > IBGE_CACHE_TTL_MS) return null;
      return parsed.d;
    } catch {
      return null;
    }
  }

  function writeIbgeCache(key, data) {
    try {
      const payload = JSON.stringify({ t: Date.now(), d: data });
      if (payload.length > 4_500_000) return;
      localStorage.setItem(key, payload);
    } catch {
      /* quota ou indisponível — cache em memória continua válido */
    }
  }

  async function fetchIbgeEstados() {
    const cached = ibgeMemory.estados || readIbgeCache(IBGE_LS_ESTADOS);
    if (Array.isArray(cached) && cached.length) {
      ibgeMemory.estados = cached;
      return cached;
    }
    const res = await fetch(`${IBGE_LOCALIDADES_BASE}/estados`);
    if (!res.ok) throw new Error("Serviço do IBGE indisponível (estados).");
    const data = await res.json();
    const mapped = [...data]
      .map((e) => ({ id: e.id, sigla: String(e.sigla || "").toUpperCase(), nome: String(e.nome || "").trim() }))
      .filter((e) => e.sigla && e.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    ibgeMemory.estados = mapped;
    writeIbgeCache(IBGE_LS_ESTADOS, mapped);
    return mapped;
  }

  async function fetchIbgeMunicipios(uf) {
    const sigla = String(uf || "")
      .trim()
      .toUpperCase();
    if (sigla.length !== 2 || !/^[A-Z]{2}$/.test(sigla)) {
      throw new Error("UF inválido.");
    }
    const mem = ibgeMemory.municipios.get(sigla);
    if (Array.isArray(mem) && mem.length) return mem;
    const cached = readIbgeCache(ibgeMunicipiosKey(sigla));
    if (Array.isArray(cached) && cached.length) {
      ibgeMemory.municipios.set(sigla, cached);
      return cached;
    }
    const res = await fetch(`${IBGE_LOCALIDADES_BASE}/estados/${encodeURIComponent(sigla)}/municipios`);
    if (!res.ok) throw new Error("Serviço do IBGE indisponível (municípios).");
    const data = await res.json();
    const mapped = [...data]
      .map((m) => ({ id: m.id, nome: String(m.nome || "").trim() }))
      .filter((m) => m.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    ibgeMemory.municipios.set(sigla, mapped);
    writeIbgeCache(ibgeMunicipiosKey(sigla), mapped);
    return mapped;
  }

  function resetUnidadeCidadeSelect() {
    if (!unidadeCreateCidade) return;
    unidadeCreateCidade.innerHTML =
      '<option value="" disabled selected>Selecione primeiro o estado</option>';
    unidadeCreateCidade.disabled = true;
  }

  async function ensureIbgeEstadosNoSelect() {
    if (!unidadeCreateEstado) return;
    if (ibgeEstadosPopulated) return;
    if (ibgeEstadosLoading) return ibgeEstadosLoading;

    ibgeEstadosLoading = (async () => {
      unidadeCreateEstado.innerHTML = '<option value="" disabled selected>Carregando estados…</option>';
      unidadeCreateEstado.disabled = true;
      try {
        const estados = await fetchIbgeEstados();
        unidadeCreateEstado.innerHTML = '<option value="" disabled selected>Selecione o estado</option>';
        for (const e of estados) {
          const opt = document.createElement("option");
          opt.value = e.sigla;
          opt.textContent = `${e.nome} (${e.sigla})`;
          unidadeCreateEstado.appendChild(opt);
        }
        unidadeCreateEstado.disabled = false;
        ibgeEstadosPopulated = true;
      } catch (err) {
        unidadeCreateEstado.innerHTML =
          '<option value="" disabled selected>Erro ao carregar estados</option>';
        unidadeCreateEstado.disabled = true;
        throw err;
      }
    })();

    try {
      await ibgeEstadosLoading;
    } finally {
      ibgeEstadosLoading = null;
    }
  }

  async function onUnidadeCreateEstadoChange() {
    const uf = String(unidadeCreateEstado?.value || "")
      .trim()
      .toUpperCase();
    if (!unidadeCreateCidade) return;
    if (!uf) {
      resetUnidadeCidadeSelect();
      return;
    }
    unidadeCreateCidade.disabled = true;
    unidadeCreateCidade.innerHTML = '<option value="" disabled selected>Carregando cidades…</option>';
    try {
      const municipios = await fetchIbgeMunicipios(uf);
      unidadeCreateCidade.innerHTML = '<option value="" disabled selected>Selecione a cidade</option>';
      for (const m of municipios) {
        const opt = document.createElement("option");
        opt.value = m.nome;
        opt.textContent = m.nome;
        unidadeCreateCidade.appendChild(opt);
      }
      unidadeCreateCidade.disabled = false;
    } catch (err) {
      unidadeCreateCidade.innerHTML =
        '<option value="" disabled selected>Erro ao carregar cidades</option>';
      showMsg(err.message || "Falha ao carregar cidades do IBGE.", "error");
    }
  }

  async function openUnidadeCreateModal() {
    if (!canManageCriticalData()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    unidadeCreateForm?.reset();
    if (unidadeCreateNomeEmpresa) unidadeCreateNomeEmpresa.value = UNIDADE_EMPRESA_NOME;
    if (unidadeCreateTipo) unidadeCreateTipo.value = "matriz";
    if (unidadeCreateAtivo) unidadeCreateAtivo.value = "1";
    resetUnidadeCidadeSelect();

    if (unidadeCreateModal) {
      unidadeCreateModal.hidden = false;
      unidadeCreateModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      try {
        await ensureIbgeEstadosNoSelect();
      } catch (err) {
        await showAlertModal({
          title: "Não foi possível carregar estados",
          message: err.message || "Verifique a conexão e tente novamente.",
        });
        closeUnidadeCreateModal();
        return;
      }
      if (unidadeCreateEstado && !unidadeCreateEstado.disabled) {
        unidadeCreateEstado.value = "";
      }
      requestAnimationFrame(() => {
        unidadeCreateModal.classList.add("is-open");
        unidadeCreateEstado?.focus();
      });
    }
  }

  function closeUnidadeCreateModal() {
    if (!unidadeCreateModal) return;
    unidadeCreateModal.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      unidadeCreateModal.hidden = true;
      unidadeCreateModal.setAttribute("aria-hidden", "true");
    }, 220);
  }

  async function handleUnidadeCreateFormSubmit(e) {
    e.preventDefault();
    const estado = String(unidadeCreateEstado?.value || "")
      .trim()
      .toUpperCase();
    const cidade = String(unidadeCreateCidade?.value || "").trim();
    if (!estado || estado.length !== 2) {
      await showAlertModal({
        title: "Local obrigatório",
        message: "Selecione o estado (UF).",
      });
      return;
    }
    if (!cidade) {
      await showAlertModal({
        title: "Local obrigatório",
        message: "Selecione a cidade.",
      });
      return;
    }
    const tipo = unidadeCreateTipo?.value === "filial" ? "filial" : "matriz";
    const ativo = Number(unidadeCreateAtivo?.value) === 0 ? 0 : 1;

    showMsg("");
    try {
      if (unidadeCreateBtnSubmit) setButtonLoading(unidadeCreateBtnSubmit, true, "Criando...");
      const created = await request("/unidades", {
        method: "POST",
        body: {
          nome: UNIDADE_EMPRESA_NOME,
          tipo,
          cidade,
          estado,
          ativo,
        },
      });
      closeUnidadeCreateModal();
      pendingRowHighlight.unidades = created?.id ?? null;
      showMsg("Unidade criada com sucesso.", "success");
      await loadUnidadesPage();
      await loadUnidades({ preserveSelection: true });
    } catch (err) {
      await showAlertModal({
        title: "Não foi possível criar",
        message: err.message || "Falha ao criar unidade",
      });
    } finally {
      if (unidadeCreateBtnSubmit) setButtonLoading(unidadeCreateBtnSubmit, false);
    }
  }

  function displayStatusText(status) {
    const value = String(status || "").trim().toLowerCase();
    if (value === "disponivel") return "Disponível";
    if (value === "em uso") return "Em uso";
    if (value === "inativo") return "Inativo";
    if (value === "finalizado") return "Finalizado";
    return status || "—";
  }

  /** Ex.: "Nome - Cidade - Estado" (omit partes vazias ou "—") */
  function formatUnidadeDisplayLabel(u) {
    if (!u || typeof u !== "object") return "—";
    const nome = String(u.nome ?? "").trim();
    const cidade = String(u.cidade ?? "").trim();
    const estado = String(u.estado ?? "").trim();
    const c = cidade && cidade !== "—" ? cidade : "";
    const e = estado && estado !== "—" ? estado : "";
    const parts = [];
    if (nome) parts.push(nome);
    if (c) parts.push(c);
    if (e) parts.push(e);
    return parts.length ? parts.join(" - ") : "—";
  }

  function formatColaboradorUnidadeCell(r) {
    if (!r) return "—";
    const nome = String(r.unidade || "").trim();
    const cidade = String(r.unidade_cidade || "").trim();
    const estado = String(r.unidade_estado || "").trim();
    if (!cidade && !estado) return nome || "—";
    return formatUnidadeDisplayLabel({ nome, cidade, estado });
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function hasValue(value) {
    return String(value || "").trim() !== "";
  }

  function countColaboradoresActiveFilters() {
    let count = 0;
    if (hasValue(colaboradoresSearch?.value)) count += 1;
    if (hasValue(colaboradoresDepartamentoFilter?.value)) count += 1;
    if (hasValue(colaboradoresCargoFilter?.value)) count += 1;
    return count;
  }

  function countEquipamentosActiveFilters() {
    let count = 0;
    if (hasValue(eqBusca?.value)) count += 1;
    if (String(equipamentosSituacaoFilter?.value || "ativo").trim() !== "ativo") count += 1;
    if (String(equipamentosDisponibilidadeFilter?.value || "all").trim() !== "all") count += 1;
    return count;
  }

  function countAtribuicoesActiveFilters() {
    let count = 0;
    if (hasValue(atribuicoesSearch?.value)) count += 1;
    if (String(atribuicoesStatusFilter?.value || "ativo").trim() !== "ativo") count += 1;
    if (hasValue(atribuicoesDataInicial?.value)) count += 1;
    if (hasValue(atribuicoesDataFinal?.value)) count += 1;
    return count;
  }

  function setFilterControlState(control, isActive) {
    if (!control) return;
    control.classList.toggle("is-active", Boolean(isActive));
  }

  function updateFilterVisualState() {
    setFilterControlState(colaboradoresSearch, hasValue(colaboradoresSearch?.value));
    setFilterControlState(colaboradoresDepartamentoFilter, hasValue(colaboradoresDepartamentoFilter?.value));
    setFilterControlState(colaboradoresCargoFilter, hasValue(colaboradoresCargoFilter?.value));

    setFilterControlState(eqBusca, hasValue(eqBusca?.value));
    setFilterControlState(
      equipamentosSituacaoFilter,
      String(equipamentosSituacaoFilter?.value || "ativo").trim() !== "ativo"
    );
    setFilterControlState(
      equipamentosDisponibilidadeFilter,
      String(equipamentosDisponibilidadeFilter?.value || "all").trim() !== "all"
    );

    setFilterControlState(atribuicoesSearch, hasValue(atribuicoesSearch?.value));
    setFilterControlState(
      atribuicoesStatusFilter,
      String(atribuicoesStatusFilter?.value || "ativo").trim() !== "ativo"
    );
    setFilterControlState(atribuicoesDataInicial, hasValue(atribuicoesDataInicial?.value));
    setFilterControlState(atribuicoesDataFinal, hasValue(atribuicoesDataFinal?.value));
  }

  function formatShortDateLabel(value) {
    const instance = getDateInstance(value);
    if (!instance) return String(value || "");
    return instance.format("DD/MM/YYYY");
  }

  function getColaboradoresActiveFilterEntries() {
    const entries = [];
    if (hasValue(colaboradoresSearch?.value)) {
      entries.push({ key: "busca", label: "Busca", value: String(colaboradoresSearch.value).trim() });
    }
    if (hasValue(colaboradoresDepartamentoFilter?.value)) {
      entries.push({
        key: "departamento",
        label: "Departamento",
        value: String(colaboradoresDepartamentoFilter.value).trim(),
      });
    }
    if (hasValue(colaboradoresCargoFilter?.value)) {
      entries.push({ key: "cargo", label: "Cargo", value: String(colaboradoresCargoFilter.value).trim() });
    }
    return entries;
  }

  function getEquipamentosActiveFilterEntries() {
    const entries = [];
    if (hasValue(eqBusca?.value)) {
      entries.push({ key: "busca", label: "Busca", value: String(eqBusca.value).trim() });
    }
    if (String(equipamentosSituacaoFilter?.value || "ativo").trim() !== "ativo") {
      entries.push({
        key: "situacao",
        label: "Situação",
        value: String(equipamentosSituacaoFilter?.selectedOptions?.[0]?.textContent || equipamentosSituacaoFilter?.value || "").trim(),
      });
    }
    if (String(equipamentosDisponibilidadeFilter?.value || "all").trim() !== "all") {
      entries.push({
        key: "disponibilidade",
        label: "Disponibilidade",
        value: String(
          equipamentosDisponibilidadeFilter?.selectedOptions?.[0]?.textContent ||
            equipamentosDisponibilidadeFilter?.value ||
            ""
        ).trim(),
      });
    }
    return entries;
  }

  function getAtribuicoesActiveFilterEntries() {
    const entries = [];
    if (hasValue(atribuicoesSearch?.value)) {
      entries.push({ key: "busca", label: "Busca", value: String(atribuicoesSearch.value).trim() });
    }
    if (String(atribuicoesStatusFilter?.value || "ativo").trim() !== "ativo") {
      entries.push({
        key: "status",
        label: "Status",
        value: String(atribuicoesStatusFilter?.selectedOptions?.[0]?.textContent || atribuicoesStatusFilter?.value || "").trim(),
      });
    }
    if (hasValue(atribuicoesDataInicial?.value)) {
      entries.push({
        key: "dataInicial",
        label: "De",
        value: formatShortDateLabel(atribuicoesDataInicial.value),
      });
    }
    if (hasValue(atribuicoesDataFinal?.value)) {
      entries.push({
        key: "dataFinal",
        label: "Até",
        value: formatShortDateLabel(atribuicoesDataFinal.value),
      });
    }
    return entries;
  }

  function renderActiveFilterTags(container, scope, filters) {
    if (!container) return;
    if (!Array.isArray(filters) || !filters.length) {
      container.innerHTML = '<span class="table-filter-tag is-empty">Nenhum filtro aplicado</span>';
      return;
    }

    container.innerHTML = filters
      .map(
        (filter) => `
          <span class="table-filter-tag">
            <span>${escapeHtml(filter.label)}: ${escapeHtml(filter.value)}</span>
            <button
              class="table-filter-tag-remove"
              type="button"
              data-filter-scope="${scope}"
              data-filter-key="${escapeHtml(filter.key)}"
              aria-label="Remover filtro ${escapeHtml(filter.label)}"
              title="Remover filtro"
            >
              ×
            </button>
          </span>
        `
      )
      .join("");
  }

  function updateFilterSummary() {
    const colActive = countColaboradoresActiveFilters();
    if (colaboradoresActiveFilters) {
      colaboradoresActiveFilters.textContent =
        colActive > 0 ? pluralize(colActive, "filtro ativo", "filtros ativos") : "Nenhum filtro ativo";
      colaboradoresActiveFilters.classList.toggle("is-neutral", colActive === 0);
    }
    if (colaboradoresResultsCount) {
      colaboradoresResultsCount.textContent = pluralize(
        Number(colaboradoresResultsTotal || 0),
        "resultado",
        "resultados"
      );
    }
    if (colaboradoresClearFiltersBtn) colaboradoresClearFiltersBtn.disabled = colActive === 0;
    renderActiveFilterTags(
      colaboradoresActiveFilterTags,
      "colaboradores",
      getColaboradoresActiveFilterEntries()
    );

    const eqActive = countEquipamentosActiveFilters();
    if (equipamentosActiveFilters) {
      equipamentosActiveFilters.textContent =
        eqActive > 0 ? pluralize(eqActive, "filtro ativo", "filtros ativos") : "Nenhum filtro ativo";
      equipamentosActiveFilters.classList.toggle("is-neutral", eqActive === 0);
    }
    if (equipamentosResultsCount) {
      equipamentosResultsCount.textContent = pluralize(
        Number(equipamentosResultsTotal || 0),
        "resultado",
        "resultados"
      );
    }
    if (equipamentosClearFiltersBtn) equipamentosClearFiltersBtn.disabled = eqActive === 0;
    renderActiveFilterTags(
      equipamentosActiveFilterTags,
      "equipamentos",
      getEquipamentosActiveFilterEntries()
    );

    const atActive = countAtribuicoesActiveFilters();
    if (atribuicoesActiveFilters) {
      atribuicoesActiveFilters.textContent =
        atActive > 0 ? pluralize(atActive, "filtro ativo", "filtros ativos") : "Nenhum filtro ativo";
      atribuicoesActiveFilters.classList.toggle("is-neutral", atActive === 0);
    }
    if (atribuicoesResultsCount) {
      atribuicoesResultsCount.textContent = pluralize(
        Number(atribuicoesResultsTotal || 0),
        "resultado",
        "resultados"
      );
    }
    if (atribuicoesClearFiltersBtn) atribuicoesClearFiltersBtn.disabled = atActive === 0;
    renderActiveFilterTags(
      atribuicoesActiveFilterTags,
      "atribuicoes",
      getAtribuicoesActiveFilterEntries()
    );

    updateFilterVisualState();
  }

  function loadUserInfo() {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    const safeUser =
      user && typeof user === "object"
        ? user
        : {
            name: "Admin",
            role: "Administrador",
          };

    if (userNameEl) userNameEl.textContent = safeUser.name || "Usuário";
    if (userRoleEl) userRoleEl.textContent = safeUser.role || "Perfil";
    if (userAvatarEl) {
      const initial = String(safeUser.name || "U").trim().charAt(0).toUpperCase() || "U";
      userAvatarEl.textContent = initial;
    }
  }

  function getStoredUserProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_KEY));
      const raw = String(parsed?.profile || parsed?.perfil || "").trim().toLowerCase();
      return raw === "admin" ? "admin" : "operador";
    } catch {
      return "operador";
    }
  }

  function getStoredUserId() {
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_KEY));
      return Number(parsed?.id || 0);
    } catch {
      return 0;
    }
  }

  function isAdminUser() {
    return getStoredUserProfile() === "admin";
  }

  function canManageCriticalData() {
    return isAdminUser();
  }

  function canManageUsers() {
    return isAdminUser();
  }

  function applyAdminVisibility() {
    const isAdmin = isAdminUser();
    if (usuariosNavItem) {
      if (!isAdmin) {
        usuariosNavItem.remove();
      } else {
        usuariosNavItem.hidden = false;
      }
    }
    if (organizacaoNavItem) {
      if (!isAdmin) {
        organizacaoNavItem.remove();
      } else {
        organizacaoNavItem.hidden = false;
      }
    }
    if (unidadesNavItem) {
      if (!isAdmin) {
        unidadesNavItem.remove();
      } else {
        unidadesNavItem.hidden = false;
      }
    }
    if (!isAdmin && currentPage === "usuarios") {
      showMsg("Acesso restrito a administradores.", "warning");
      showPage("dashboard");
    }
    if (!isAdmin && currentPage === "organizacao") {
      showMsg("Acesso restrito a administradores.", "warning");
      showPage("dashboard");
    }
    if (!isAdmin && currentPage === "unidades") {
      showMsg("Acesso restrito a administradores.", "warning");
      showPage("dashboard");
    }

    const canManage = canManageCriticalData();
    if (colaboradorNewBtn) colaboradorNewBtn.hidden = !canManage;
    if (equipamentoNewBtn) equipamentoNewBtn.hidden = !canManage;
    if (atribuicaoNewBtn) atribuicaoNewBtn.hidden = false;
  }

  function normalizeTextCase(value) {
    const smallWords = new Set(["de", "da", "do", "das", "dos", "e"]);
    const acronyms = new Set(["ti", "rh", "pcp", "dp", "qa", "bi", "tii"]);
    return String(value || "")
      .trim()
      .toLocaleLowerCase("pt-BR")
      .split(/\s+/)
      .filter(Boolean)
      .map((word, index) => {
        if (acronyms.has(word)) return word.toUpperCase();
        if (index > 0 && smallWords.has(word)) return word;
        return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
      })
      .join(" ");
  }

  function getNameInitials(value) {
    const parts = String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderEmptyRow(tbody, colspan, title, message) {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="saas-empty-row">
          <div class="saas-empty-state">
            <div class="saas-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="14" rx="3"></rect>
                <path d="M8 20h8"></path>
                <path d="M8 9h8"></path>
              </svg>
            </div>
            <div class="saas-empty-title">${escapeHtml(title)}</div>
            <div class="saas-empty-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
    `;
  }

  function renderLoadingRow(tbody, colspan, message = "Carregando dados...") {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="saas-empty-row">
          <div class="saas-loading-state">
            <span class="saas-spinner" aria-hidden="true"></span>
            <div class="saas-loading-text">${escapeHtml(message)}</div>
          </div>
        </td>
      </tr>
    `;
  }

  async function animateListTransition(wrapper, direction, render) {
    if (!wrapper || typeof render !== "function") {
      render?.();
      return;
    }
    if (wrapper.dataset.animating === "true") return;

    wrapper.dataset.animating = "true";

    wrapper.classList.remove("is-page-entering", "to-next", "to-prev");
    wrapper.classList.add("is-page-leaving", direction === "prev" ? "to-prev" : "to-next");

    await new Promise((resolve) => window.setTimeout(resolve, 100));

    render();

    wrapper.classList.remove("is-page-leaving", "to-next", "to-prev");
    wrapper.classList.add("is-page-entering", direction === "prev" ? "to-prev" : "to-next");

    await new Promise((resolve) => window.setTimeout(resolve, LIST_TRANSITION_MS));

    wrapper.classList.remove("is-page-entering", "to-next", "to-prev");
    delete wrapper.dataset.animating;
  }

  function statusBadge(status) {
    const value = String(status || "").trim().toLowerCase();
    const cls =
      value === "disponivel"
        ? "success"
        : value === "em uso"
          ? "warning"
          : value === "inativo"
            ? "critical"
            : "neutral";
    return `<span class="saas-badge ${cls}"><span class="saas-badge-dot"></span>${escapeHtml(displayStatusText(status))}</span>`;
  }

  function perfilBadge(perfil) {
    const value = String(perfil || "").trim().toLowerCase();
    const label = value === "admin" ? "Admin" : "Operador";
    const cls = value === "admin" ? "info" : "neutral";
    return `<span class="saas-badge ${cls}">${escapeHtml(label)}</span>`;
  }

  function actionStateBadge(kind) {
    const value = String(kind || "").trim().toLowerCase();
    if (value === "self") {
      return `<span class="saas-badge neutral">${escapeHtml("Sessão atual")}</span>`;
    }
    return "";
  }

  function getDateInstance(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}\s/.test(raw) ? raw.replace(" ", "T") : raw;
    if (!window.dayjs) return null;
    const instance = window.dayjs(normalized);
    return instance.isValid() ? instance : null;
  }

  function formatDateLabel(value) {
    const instance = getDateInstance(value);
    if (!instance) return escapeHtml(value || "—");
    return escapeHtml(instance.format("DD/MM/YYYY [às] HH:mm"));
  }

  function renderActivityState(title, message, isLoading = false) {
    if (!activityList) return;
    activityList.innerHTML = `
      <div class="saas-activity-empty ${isLoading ? "is-loading" : ""}">
        <div class="saas-empty-state compact">
          <div class="saas-empty-icon" aria-hidden="true">
            ${
              isLoading
                ? '<span class="saas-spinner"></span>'
                : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="9"></circle></svg>`
            }
          </div>
          <div class="saas-empty-title">${escapeHtml(title)}</div>
          <div class="saas-empty-text">${escapeHtml(message)}</div>
        </div>
      </div>
    `;
  }

  function setButtonLoading(button, isLoading, loadingText) {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalText = button.textContent.trim();
      button.disabled = true;
      button.classList.add("is-loading");
      button.textContent = loadingText;
      return;
    }

    button.disabled = false;
    button.classList.remove("is-loading");
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }

  function getEditableFields(form) {
    if (!form) return [];
    return Array.from(form.querySelectorAll("input, select")).filter(
      (field) =>
        !field.disabled &&
        field.type !== "hidden" &&
        !field.classList.contains("atrib-equip-hidden-select")
    );
  }

  function focusField(field) {
    if (!field) return;
    window.requestAnimationFrame(() => {
      field.focus();
      if (field.tagName === "INPUT") field.select?.();
    });
  }

  function focusNextField(field) {
    const form = field?.form;
    if (!form) return false;
    const fields = getEditableFields(form);
    const index = fields.indexOf(field);
    const nextField = index >= 0 ? fields[index + 1] : null;
    if (!nextField) return false;
    focusField(nextField);
    return true;
  }

  function focusFirstField(form) {
    const [firstField] = getEditableFields(form);
    focusField(firstField);
  }

  function focusFirstFieldForPage(page) {
    if (page === "colaboradores") {
      if (colaboradorFormPanel && !colaboradorFormPanel.hidden) {
        focusFirstField(colaboradorForm);
      } else {
        focusField(colaboradoresSearch);
      }
      return;
    }
    if (page === "equipamentos") {
      if (equipamentoFormPanel && !equipamentoFormPanel.hidden) {
        focusFirstField(equipamentoForm);
      } else {
        focusField(eqBusca);
      }
      return;
    }
    if (page === "atribuicoes") {
      if (atribuicaoFormPanel && !atribuicaoFormPanel.hidden) {
        focusFirstField(atribuirForm);
      } else {
        focusField(atribuicoesSearch);
      }
    }
  }

  function setColaboradorFormOpen(isOpen) {
    if (!colaboradorFormPanel) return;
    colaboradorFormPanel.hidden = !isOpen;
    colaboradorFormPanel.classList.toggle("is-open", isOpen);
    if (colaboradorNewBtn) {
      colaboradorNewBtn.textContent = isOpen ? "Fechar cadastro" : "+ Novo colaborador";
    }
    if (!isOpen) {
      colaboradorEditingId = null;
      resetForm(colaboradorForm);
      const head = colaboradorFormPanel.querySelector(".saas-drawer-head strong");
      const sub = colaboradorFormPanel.querySelector(".saas-drawer-head span");
      if (head) head.textContent = "Novo colaborador";
      if (sub) sub.textContent = "Cadastre rapidamente um novo membro da equipe com os dados principais.";
      const submitLabel = colaboradorForm?.querySelector("button[type='submit']");
      if (submitLabel) submitLabel.textContent = "Cadastrar colaborador";
      void loadCargosForDepartamento(null);
    }
  }

  function setEquipamentoFormOpen(isOpen) {
    if (!equipamentoFormPanel) return;
    equipamentoFormPanel.hidden = !isOpen;
    equipamentoFormPanel.classList.toggle("is-open", isOpen);
    if (equipamentoNewBtn) {
      equipamentoNewBtn.textContent = isOpen ? "Fechar formulário" : "+ Novo equipamento";
    }
  }

  function resetEquipamentoForm() {
    resetForm(equipamentoForm);
    if (equipamentoIdInput) equipamentoIdInput.value = "";
    if (equipamentoDrawerTitle) equipamentoDrawerTitle.textContent = "Cadastrar equipamento";
    if (equipamentoDrawerSubtitle) {
      equipamentoDrawerSubtitle.textContent =
        "Preencha os dados do ativo. O código será gerado automaticamente pelo sistema.";
    }
    if (equipamentoSubmitBtn) equipamentoSubmitBtn.textContent = "Cadastrar equipamento";
    if (equipamentoValorInput) equipamentoValorInput.value = "";
  }

  function startEquipamentoCreate() {
    resetEquipamentoForm();
    setEquipamentoFormOpen(true);
    focusFirstField(equipamentoForm);
  }

  function startEquipamentoEdit(item) {
    if (!item || !equipamentoForm) return;
    resetEquipamentoForm();
    if (equipamentoIdInput) equipamentoIdInput.value = String(item.id);
    document.getElementById("eq_nome").value = String(item.nome || "");
    document.getElementById("eq_serial").value = String(item.serial || "");
    document.getElementById("eq_modelo").value = String(item.modelo || "");
    document.getElementById("eq_marca").value = String(item.marca || "");
    document.getElementById("eq_observacoes").value = String(item.observacoes || "");
    if (equipamentoValorInput) {
      const v = parseValorEquipamento(item.valor);
      equipamentoValorInput.value = v != null && Number.isFinite(v) ? formatNumberToBrl(v) : "";
    }
    document.getElementById("eq_status").value = String(item.status || "");
    if (equipamentoDrawerTitle) equipamentoDrawerTitle.textContent = "Editar equipamento";
    if (equipamentoDrawerSubtitle) {
      equipamentoDrawerSubtitle.textContent =
        `Código ${String(item.codigo_barras || "—")} gerado pelo sistema e bloqueado para edição.`;
    }
    if (equipamentoSubmitBtn) equipamentoSubmitBtn.textContent = "Salvar alterações";
    resetFormState(equipamentoForm);
    setEquipamentoFormOpen(true);
    focusFirstField(equipamentoForm);
  }

  function setAtribuicaoFormOpen(isOpen) {
    if (!atribuicaoFormPanel) return;
    atribuicaoFormPanel.hidden = !isOpen;
    atribuicaoFormPanel.classList.toggle("is-open", isOpen);
    if (atribuicaoNewBtn) {
      atribuicaoNewBtn.textContent = isOpen ? "Fechar atribuição" : "+ Nova atribuição";
    }
  }

  const cargoSelect = document.getElementById("cargo");
  const departamentoSelect = document.getElementById("departamento");
  const unidadeSelect = document.getElementById("unidade");

  let colaboradorEditingId = null;

  async function loadDepartamentos({ preserveSelection = true, selectId = null } = {}) {
    if (!departamentoSelect) return;
    const current = preserveSelection ? String(departamentoSelect.value || "") : "";
    try {
      const deps = await request("/departamentos");
      departamentoSelect.innerHTML = '<option value="" selected disabled>Selecione o departamento</option>';
      for (const d of Array.isArray(deps) ? deps : []) {
        const opt = document.createElement("option");
        opt.value = String(d.id);
        opt.textContent = String(d.nome || "");
        departamentoSelect.appendChild(opt);
      }
      const createOpt = document.createElement("option");
      createOpt.value = "__create_departamento__";
      createOpt.textContent = "+ Criar novo departamento";
      departamentoSelect.appendChild(createOpt);
      const nextValue = selectId != null ? String(selectId) : current;
      if (nextValue) departamentoSelect.value = nextValue;
    } catch {
      departamentoSelect.innerHTML =
        '<option value="" selected disabled>Não foi possível carregar departamentos</option>';
    }
  }

  function filtrarCargosPorDepartamento(departamentoId) {
    return loadCargosForDepartamento(departamentoId, { preserveSelection: false });
  }

  async function loadCargosForDepartamento(
    departamentoId,
    { preserveSelection = false, selectId = null } = {}
  ) {
    if (!cargoSelect) return;
    const depNum = Number(departamentoId);
    const current = preserveSelection ? String(cargoSelect.value || "") : "";

    if (!Number.isInteger(depNum) || depNum <= 0) {
      cargoSelect.innerHTML =
        '<option value="" selected disabled>Selecione o departamento primeiro</option>';
      cargoSelect.disabled = true;
      cargoSelect.value = "";
      return;
    }

    cargoSelect.disabled = false;

    try {
      const rows = await request(`/cargos?departamento_id=${encodeURIComponent(depNum)}`);
      cargoSelect.innerHTML = '<option value="" selected disabled>Selecione o cargo</option>';
      for (const c of Array.isArray(rows) ? rows : []) {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = String(c.nome || "");
        cargoSelect.appendChild(opt);
      }
      const createOpt = document.createElement("option");
      createOpt.value = "__create_cargo__";
      createOpt.textContent = "+ Criar novo cargo";
      cargoSelect.appendChild(createOpt);
      const nextValue = selectId != null ? String(selectId) : current;
      if (nextValue && Array.from(cargoSelect.options).some((o) => o.value === nextValue)) {
        cargoSelect.value = nextValue;
      }
    } catch {
      cargoSelect.innerHTML =
        '<option value="" selected disabled>Não foi possível carregar cargos</option>';
    }
  }

  async function loadUnidades({ preserveSelection = true, selectId = null } = {}) {
    if (!unidadeSelect) return;
    const current = preserveSelection ? String(unidadeSelect.value || "") : "";
    try {
      const rows = await request("/unidades");
      const list = Array.isArray(rows) ? rows : [];
      unidadesCache = list;
      unidadeSelect.innerHTML = '<option value="" selected disabled>Selecione a unidade</option>';
      for (const u of list.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"))) {
        const opt = document.createElement("option");
        opt.value = String(u.id);
        opt.textContent = formatUnidadeDisplayLabel(u);
        unidadeSelect.appendChild(opt);
      }
      const nextValue = selectId != null ? String(selectId) : current;
      if (nextValue && Array.from(unidadeSelect.options).some((o) => o.value === nextValue)) {
        unidadeSelect.value = nextValue;
      }
    } catch {
      unidadeSelect.innerHTML =
        '<option value="" selected disabled>Não foi possível carregar unidades</option>';
    }
  }

  function highlightRowIfNeeded(row, tableKey, rowKey) {
    if (!row || pendingRowHighlight[tableKey] == null) return;
    if (String(pendingRowHighlight[tableKey]) !== String(rowKey)) return;
    row.classList.add("saas-row-highlight");
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      row.classList.remove("saas-row-highlight");
      if (String(pendingRowHighlight[tableKey]) === String(rowKey)) {
        pendingRowHighlight[tableKey] = null;
      }
    }, 2600);
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCpf(value) {
    const digits = digitsOnly(value).slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function parseBrlToNumber(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return null;
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return null;
    const cents = Number(digits);
    if (!Number.isFinite(cents)) return null;
    return cents / 100;
  }

  /** Valor numérico para enviar na API (POST/PATCH equipamentos). */
  function moedaParaNumero(inputValor) {
    return parseBrlToNumber(inputValor);
  }

  /** Normaliza valor vindo da API/banco (número ou string) para exibição. */
  function parseValorEquipamento(val) {
    if (val == null || val === "") return null;
    if (typeof val === "number") return Number.isFinite(val) ? val : null;
    const s = String(val).trim().replace(/\s/g, "");
    if (!s) return null;
    const asNum = Number(s.replace(",", "."));
    if (Number.isFinite(asNum)) return asNum;
    return parseBrlToNumber(s);
  }

  function formatNumberToBrl(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "R$ 0,00";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatBrlOnInput(value) {
    const digits = String(value || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    const cents = Number(digits);
    if (!Number.isFinite(cents)) return "";
    return formatNumberToBrl(cents / 100);
  }

  function isValidCpf(value) {
    const cpf = digitsOnly(value);
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
    let check = (sum * 10) % 11;
    if (check === 10) check = 0;
    if (check !== Number(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
    check = (sum * 10) % 11;
    if (check === 10) check = 0;
    return check === Number(cpf[10]);
  }

  function isValidCnpjDigits(digits) {
    const cnpj = String(digits || "");
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i += 1) sum += Number(cnpj[i]) * w1[i];
    let mod = sum % 11;
    const d1 = mod < 2 ? 0 : 11 - mod;
    if (d1 !== Number(cnpj[12])) return false;
    sum = 0;
    for (let i = 0; i < 13; i += 1) sum += Number(cnpj[i]) * w2[i];
    mod = sum % 11;
    const d2 = mod < 2 ? 0 : 11 - mod;
    return d2 === Number(cnpj[13]);
  }

  function formatDocumentoMask(value) {
    const d = digitsOnly(value).slice(0, 14);
    if (!d.length) return "";
    if (d.length <= 11) return formatCpf(d);
    let out = d.slice(0, 2);
    if (d.length > 2) out += `.${d.slice(2, 5)}`;
    if (d.length > 5) out += `.${d.slice(5, 8)}`;
    if (d.length > 8) out += `/${d.slice(8, 12)}`;
    if (d.length > 12) out += `-${d.slice(12, 14)}`;
    return out;
  }

  function updateDocumentoHintUi() {
    const el = document.getElementById("documento");
    const hint = document.getElementById("documentoHint");
    if (!el || !hint) return;
    const d = digitsOnly(el.value);
    if (!d.length) {
      hint.textContent = "";
      el.setAttribute("placeholder", "Digite CPF ou CNPJ");
      return;
    }
    hint.textContent = d.length <= 11 ? "CPF detectado" : "CNPJ detectado";
    el.setAttribute("placeholder", d.length <= 11 ? "000.000.000-00" : "00.000.000/0000-00");
  }

  const fieldRules = {
    nome: {
      requiredMessage: "Informe o nome.",
      normalizeOnBlur: normalizeTextCase,
      validate: (value) =>
        value.length >= 3 ? "" : "Informe o nome completo do colaborador.",
    },
    documento: {
      requiredMessage: "Informe o documento.",
      formatOnInput: (value) => {
        const formatted = formatDocumentoMask(value);
        window.requestAnimationFrame(() => updateDocumentoHintUi());
        return formatted;
      },
      autoAdvance: (value) => {
        const d = digitsOnly(value);
        if (d.length === 11 && isValidCpf(value)) return true;
        if (d.length === 14 && isValidCnpjDigits(d)) return true;
        return false;
      },
      validate: (value) => {
        const d = digitsOnly(value);
        if (!d.length) return "";
        if (d.length !== 11 && d.length !== 14) {
          return "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) completo.";
        }
        if (d.length === 11) return isValidCpf(value) ? "" : "CPF inválido.";
        return isValidCnpjDigits(d) ? "" : "CNPJ inválido.";
      },
    },
    cargo: {
      requiredMessage: "Selecione um cargo.",
    },
    departamento: {
      requiredMessage: "Selecione um departamento.",
    },
    unidade: {
      requiredMessage: "Selecione uma unidade.",
    },
    eq_nome: {
      requiredMessage: "Informe o nome do equipamento.",
      validate: (value) =>
        value.length >= 3 ? "" : "Informe o nome do equipamento.",
    },
    eq_serial: {
      requiredMessage: "Informe o serial.",
      validate: (value) => (value.length >= 3 ? "" : "Informe um serial válido."),
    },
    eq_modelo: {},
    eq_marca: {
      requiredMessage: "Informe a marca.",
      normalizeOnBlur: normalizeTextCase,
      validate: (value) =>
        value.length >= 2 ? "" : "Informe a marca do equipamento.",
    },
    eq_observacoes: {},
    eq_valor: {
      formatOnInput: formatBrlOnInput,
      validate: (value) => {
        const parsed = parseBrlToNumber(value);
        if (parsed == null) return "";
        return parsed >= 0 ? "" : "Valor inválido.";
      },
    },
    eq_status: {
      requiredMessage: "Selecione o status do equipamento.",
    },
    atrib_colaborador: {
      requiredMessage: "Selecione um colaborador.",
    },
    atrib_equipamento: {
      requiredMessage: "Selecione pelo menos um equipamento disponível.",
      validate: (_value, field) => {
        const total = field?.selectedOptions?.length || 0;
        return total > 0 ? "" : "Selecione pelo menos um equipamento disponível.";
      },
    },
  };

  function getFieldWrapper(field) {
    return field?.closest(".saas-field");
  }

  function setFieldState(field, state, message = "") {
    const wrapper = getFieldWrapper(field);
    if (!wrapper || !field) return;
    const errorEl = wrapper.querySelector(".saas-field-error");

    wrapper.classList.remove("is-valid", "is-invalid");
    if (state === "valid") wrapper.classList.add("is-valid");
    if (state === "invalid") wrapper.classList.add("is-invalid");

    field.classList.remove("input-success", "input-error");
    if (state === "valid") field.classList.add("input-success");

    field.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
  }

  function validateField(field, { forceTouch = false } = {}) {
    if (field?.disabled) return true;
    if (!field?.id || !fieldRules[field.id]) return true;
    const rule = fieldRules[field.id];
    const rawValue = String(field.value || "");
    const value = rawValue.trim();

    if (forceTouch) field.dataset.touched = "true";
    const touched = field.dataset.touched === "true";
    if (!touched && !forceTouch) return true;

    const isMultiSelect = field.tagName === "SELECT" && field.multiple;
    const isEmptyMultiSelect = isMultiSelect && (field.selectedOptions?.length || 0) === 0;

    if (!value || isEmptyMultiSelect) {
      if (rule.requiredMessage) {
        setFieldState(field, "invalid", rule.requiredMessage);
        return false;
      }
      setFieldState(field, "", "");
      return true;
    }

    const message = typeof rule.validate === "function" ? rule.validate(value, field) : "";
    if (message) {
      setFieldState(field, "invalid", message);
      return false;
    }

    setFieldState(field, "valid");
    return true;
  }

  function validateForm(form) {
    if (!form) return true;
    const fields = Array.from(form.querySelectorAll("input, select"));
    let isFormValid = true;
    fields.forEach((field) => {
      if (field.disabled) return;
      if (!validateField(field, { forceTouch: true })) isFormValid = false;
    });
    return isFormValid;
  }

  function resetFormState(form) {
    if (!form) return;
    form.querySelectorAll("input, select").forEach((field) => {
      delete field.dataset.touched;
      delete field.dataset.autoAdvanced;
      setFieldState(field, "", "");
    });
  }

  function resetForm(formElement) {
    if (!formElement) return;
    formElement.reset();
    formElement.querySelectorAll(".input-success, .input-error").forEach((el) => {
      el.classList.remove("input-success", "input-error");
    });
    formElement.querySelectorAll(".saas-field").forEach((w) => {
      w.classList.remove("is-valid", "is-invalid");
    });
    formElement.querySelectorAll(".saas-field-error").forEach((el) => {
      el.textContent = "";
      el.hidden = true;
    });
    formElement.querySelectorAll(".form-hint").forEach((el) => {
      el.textContent = "";
    });
    formElement.querySelectorAll("input, select, textarea").forEach((field) => {
      delete field.dataset.touched;
      delete field.dataset.autoAdvanced;
      field.setAttribute("aria-invalid", "false");
    });
    if (formElement.querySelector("#documento")) {
      updateDocumentoHintUi();
    }
    if (formElement.id === "atribuirForm") {
      syncAtribEquipamentoUI();
    }
  }

  window.resetForm = resetForm;

  function setupFieldValidation(field) {
    if (!field?.id || !fieldRules[field.id]) return;
    const rule = fieldRules[field.id];

    field.addEventListener("input", () => {
      if (typeof rule.formatOnInput === "function") {
        field.value = rule.formatOnInput(field.value);
      }
      if (typeof rule.autoAdvance === "function") {
        const shouldAdvance = rule.autoAdvance(field.value, field);
        if (shouldAdvance && field.dataset.autoAdvanced !== "true") {
          field.dataset.autoAdvanced = "true";
          focusNextField(field);
        }
        if (!shouldAdvance) delete field.dataset.autoAdvanced;
      }
      if (field.dataset.touched === "true") setFieldState(field, "", "");
    });

    field.addEventListener("change", () => {
      if (field.id === "atrib_equipamento") return;
      if (field.tagName === "SELECT" && field.value) focusNextField(field);
    });

    field.addEventListener("blur", () => {
      if (typeof rule.normalizeOnBlur === "function" && field.value.trim()) {
        field.value = rule.normalizeOnBlur(field.value);
      }
      field.dataset.touched = "true";
      validateField(field);
    });

    field.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      const isValid = validateField(field, { forceTouch: true });
      if (!isValid) return;
      if (focusNextField(field)) return;
      field.form?.requestSubmit?.();
    });
  }

  function setupFormValidation() {
    dashboardForms.forEach((form) => {
      form.querySelectorAll("input, select").forEach(setupFieldValidation);
    });
  }

  function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function redirectToLogin(message, type = "warning") {
    clearAuthData();
    if (message) {
      window.appToast?.queuePendingToast?.({
        type,
        title: type === "error" ? "Acesso interrompido" : "Sessão encerrada",
        message,
      });
    }
    window.location.href = "/login.html";
  }

  function isTokenExpired() {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
    if (!expiresAt) return false;
    const timestamp = new Date(expiresAt).getTime();
    return Number.isFinite(timestamp) && timestamp <= Date.now();
  }

  function getTokenOrRedirect() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      clearAuthData();
      window.location.href = "/login.html";
      return null;
    }
    if (isTokenExpired()) {
      redirectToLogin("Sua sessão expirou. Faça login novamente.");
      return null;
    }
    return token;
  }

  function showMsg(text, type = "error") {
    const message = String(text || "").trim();
    if (!message) {
      if (globalMsg) globalMsg.style.display = "none";
      return;
    }

    if (globalMsg) {
      globalMsg.textContent = "";
      globalMsg.style.display = "none";
    }

    if (window.appToast?.show) {
      window.appToast.show(message, { type });
      return;
    }

    if (!globalMsg) return;
    globalMsg.textContent = message;
    globalMsg.dataset.type = type;
    globalMsg.style.display = "block";
  }

  async function request(path, { method = "GET", body } = {}) {
    const token = getTokenOrRedirect();
    if (!token) throw new Error("Sem token");

    const headers = { Authorization: `Bearer ${token}` };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      if (res.status === 401) {
        const unauthorizedMessage =
          data?.error || "Sua sessão expirou. Faça login novamente.";
        redirectToLogin(unauthorizedMessage);
        throw new Error(unauthorizedMessage);
      }

      let message = data?.error || data?.message || `Erro HTTP ${res.status}`;

      if (res.status === 404 && path.startsWith("/equipamentos/")) {
        message =
          method === "PUT" || method === "PATCH"
            ? "A atualização do equipamento não está disponível na API ativa. Reinicie o servidor e tente novamente."
            : "Equipamento não encontrado. Atualize a lista e tente novamente.";
      }

      throw new Error(message);
    }

    return data;
  }

  function openSidebar() {
    sidebar?.classList.add("is-open");
    backdrop.hidden = false;
  }

  function closeSidebar() {
    sidebar?.classList.remove("is-open");
    backdrop.hidden = true;
  }

  function setActiveNav(page) {
    navItems.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.page === page);
    });
  }

  function getPageMeta(page) {
    return {
      dashboard: {
        title: "Painel operacional",
        subtitle: "Visão geral da operação Boi Brabo",
      },
      colaboradores: {
        title: "Colaboradores",
        subtitle: "Cadastro e gestão da equipe",
      },
      equipamentos: {
        title: "Equipamentos",
        subtitle: "Inventário e disponibilidade dos ativos",
      },
      atribuicoes: {
        title: "Atribuições",
        subtitle: "Entregas, devoluções e acompanhamento",
      },
      relatorios: {
        title: "Relatórios",
        subtitle: "Dashboard financeiro dos equipamentos",
      },
      organizacao: {
        title: "Departamentos & Cargos",
        subtitle: "Estrutura organizacional do sistema",
      },
      unidades: {
        title: "Unidades",
        subtitle: "Matriz, filiais e localização",
      },
      usuarios: {
        title: "Usuários",
        subtitle: "Gerenciamento de acessos e perfis",
      },
    }[page];
  }

  function refreshPageData(page) {
    if (page === "dashboard") refreshStatsAndActivities().catch(() => {});
    if (page === "colaboradores") loadColaboradores().catch(() => {});
    if (page === "equipamentos") loadEquipamentos().catch(() => {});
    if (page === "atribuicoes") loadAtribuicoesPage().catch(() => {});
    if (page === "relatorios") loadRelatoriosPage().catch(() => {});
    if (page === "organizacao") loadOrganizacaoPage().catch(() => {});
    if (page === "unidades") loadUnidadesPage().catch(() => {});
    if (page === "usuarios") loadUsuarios().catch(() => {});
  }

  function openAtribuicoesWithFilter(query) {
    const normalizedQuery = String(query || "").trim();
    if (atribuicoesSearch) {
      atribuicoesSearch.value = normalizedQuery;
      atribuicoesCurrentPage = 1;
    }
    if (atribuicoesStatusFilter) atribuicoesStatusFilter.value = "ativo";
    if (atribuicoesDataInicial) atribuicoesDataInicial.value = "";
    if (atribuicoesDataFinal) atribuicoesDataFinal.value = "";
    showPage("atribuicoes");
    closeSidebar();
  }

  function removeFilterChip(scope, key) {
    if (scope === "colaboradores") {
      if (key === "busca" && colaboradoresSearch) colaboradoresSearch.value = "";
      if (key === "departamento" && colaboradoresDepartamentoFilter) {
        colaboradoresDepartamentoFilter.value = "";
      }
      if (key === "cargo" && colaboradoresCargoFilter) colaboradoresCargoFilter.value = "";
      colaboradoresCurrentPage = 1;
      updateFilterSummary();
      loadColaboradoresListPage(1);
      return;
    }

    if (scope === "equipamentos") {
      if (key === "busca" && eqBusca) eqBusca.value = "";
      if (key === "situacao" && equipamentosSituacaoFilter) equipamentosSituacaoFilter.value = "ativo";
      if (key === "disponibilidade" && equipamentosDisponibilidadeFilter) {
        equipamentosDisponibilidadeFilter.value = "all";
      }
      equipamentosCurrentPage = 1;
      updateFilterSummary();
      loadEquipamentosListPage(1);
      return;
    }

    if (scope === "atribuicoes") {
      if (key === "busca" && atribuicoesSearch) atribuicoesSearch.value = "";
      if (key === "status" && atribuicoesStatusFilter) atribuicoesStatusFilter.value = "ativo";
      if (key === "dataInicial" && atribuicoesDataInicial) atribuicoesDataInicial.value = "";
      if (key === "dataFinal" && atribuicoesDataFinal) atribuicoesDataFinal.value = "";
      atribuicoesCurrentPage = 1;
      updateFilterSummary();
      loadAtribuicoesListPage(1);
    }
  }

  function showPage(page, { syncUrl = true, replaceHistory = false } = {}) {
    if (!page) return;
    if (page === "usuarios" && !canManageUsers()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    if ((page === "organizacao" || page === "unidades") && !canManageCriticalData()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    if (isPageTransitioning) {
      queuedPage = page;
      return;
    }
    if (page === currentPage) {
      setActiveNav(page);
      if (syncUrl) syncUrlState({ view: page, replace: replaceHistory });
      refreshPageData(page);
      return;
    }

    isPageTransitioning = true;
    queuedPage = null;

    const currentPageEl = pages.find((p) => p.dataset.page === currentPage);
    const nextPageEl = pages.find((p) => p.dataset.page === page);
    if (!nextPageEl) {
      isPageTransitioning = false;
      return;
    }

    currentPage = page;
    setActiveNav(page);
    if (syncUrl) syncUrlState({ view: page, replace: replaceHistory });

    const meta = getPageMeta(page);
    if (meta) {
      pageTitle.textContent = meta.title;
      pageSubtitle.textContent = meta.subtitle;
    }

    refreshPageData(page);

    if (currentPageEl) {
      currentPageEl.classList.remove("is-entering");
      currentPageEl.classList.add("is-leaving");
    }

    window.setTimeout(() => {
      if (currentPageEl) {
        currentPageEl.hidden = true;
        currentPageEl.classList.remove("is-leaving");
      }

      pages.forEach((p) => {
        if (p !== nextPageEl) p.hidden = true;
      });

      nextPageEl.hidden = false;
      nextPageEl.classList.remove("is-leaving");
      void nextPageEl.offsetWidth;
      nextPageEl.classList.add("is-entering");

      window.setTimeout(() => {
        nextPageEl.classList.remove("is-entering");
        isPageTransitioning = false;
        if (currentPage === page) focusFirstFieldForPage(page);

        if (queuedPage && queuedPage !== page) {
          const nextQueuedPage = queuedPage;
          queuedPage = null;
          showPage(nextQueuedPage);
        }
      }, PAGE_TRANSITION_MS);
    }, currentPageEl ? PAGE_TRANSITION_MS - 60 : 0);
  }

  function formatDatePill() {
    if (!currentDate) return;
    const text = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    currentDate.textContent = text;
  }

  function relativeTime(iso) {
    const instance = getDateInstance(iso);
    if (!instance) return String(iso || "—");
    return instance.fromNow();
  }

  function renderColaboradores(rows) {
    colaboradoresTbody.innerHTML = "";
    if (!rows || !rows.length) {
      const hasFilters = Boolean(
        String(colaboradoresSearch?.value || "").trim() ||
          String(colaboradoresDepartamentoFilter?.value || "").trim() ||
          String(colaboradoresCargoFilter?.value || "").trim()
      );
      renderEmptyRow(
        colaboradoresTbody,
        5,
        hasFilters ? "Nenhum resultado encontrado" : "Nenhum colaborador cadastrado",
        hasFilters
          ? "Nenhum resultado encontrado para os filtros aplicados."
          : "Comece adicionando o primeiro colaborador para estruturar sua operação."
      );
      return;
    }
    for (const r of rows || []) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="saas-colab-person">
            <span class="saas-colab-avatar">${escapeHtml(getNameInitials(r.nome))}</span>
            <div class="saas-colab-person-copy">
              <div class="saas-cell-title">${escapeHtml(r.nome)}</div>
              <div class="table-subtext">${escapeHtml(formatDocumentoMask(r.documento || r.cpf || ""))}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-role">${escapeHtml(r.cargo)}</span></td>
        <td><span class="badge badge-role">${escapeHtml(r.departamento || "—")}</span></td>
        <td><span class="saas-code">${escapeHtml(formatColaboradorUnidadeCell(r))}</span></td>
        <td>
          <div class="saas-table-actions">
            <button
              class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action"
              type="button"
              data-action="open-colaborador-menu"
              data-colaborador-id="${escapeHtml(r.id)}"
              title="Ações"
              aria-label="Ações"
            >
              Ações ▾
            </button>
          </div>
        </td>
      `;
      highlightRowIfNeeded(tr, "colaboradores", r.id);
      colaboradoresTbody.appendChild(tr);
    }
  }

  async function refreshColaboradoresFilterDropdowns(rows) {
    const items = Array.isArray(rows) ? rows : [];
    const depAtual = String(colaboradoresDepartamentoFilter?.value || "");
    const cargoAtual = String(colaboradoresCargoFilter?.value || "");

    const fromRows = items
      .map((item) => String(item.departamento || item.setor || "").trim())
      .filter(Boolean);
    let namesFromApi = [];
    try {
      const deps = await request("/departamentos");
      namesFromApi = Array.isArray(deps) ? deps.map((d) => String(d.nome || "").trim()).filter(Boolean) : [];
    } catch {
      namesFromApi = [];
    }
    const departamentos = Array.from(new Set([...namesFromApi, ...fromRows])).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    if (colaboradoresDepartamentoFilter) {
      colaboradoresDepartamentoFilter.innerHTML = '<option value="">Todos os departamentos</option>';
      departamentos.forEach((nome) => {
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        colaboradoresDepartamentoFilter.appendChild(option);
      });
      colaboradoresDepartamentoFilter.value = depAtual;
    }

    const cargos = Array.from(
      new Set(items.map((item) => String(item.cargo || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    if (colaboradoresCargoFilter) {
      colaboradoresCargoFilter.innerHTML = '<option value="">Todos os cargos</option>';
      cargos.forEach((cargo) => {
        const option = document.createElement("option");
        option.value = cargo;
        option.textContent = cargo;
        colaboradoresCargoFilter.appendChild(option);
      });
      colaboradoresCargoFilter.value = cargoAtual;
    }
  }

  function updateColaboradoresMetrics(rows) {
    const items = Array.isArray(rows) ? rows : [];
    const departamentosUnicos = new Set(
      items.map((item) => String(item.departamento || item.setor || "").trim()).filter(Boolean)
    );
    const cargos = new Set(
      items.map((item) => String(item.cargo || "").trim()).filter(Boolean)
    );

    if (colaboradoresMetricTotal) colaboradoresMetricTotal.textContent = String(items.length);
    if (colaboradoresMetricDepartamentos) {
      colaboradoresMetricDepartamentos.textContent = String(departamentosUnicos.size);
    }
    if (colaboradoresMetricCargos) colaboradoresMetricCargos.textContent = String(cargos.size);
  }

  function updateEquipamentosMetrics(rows) {
    const items = Array.isArray(rows) ? rows : [];
    const disponiveis = items.filter(
      (item) => String(item.status || "").trim().toLowerCase() === "disponivel"
    ).length;
    const emUso = items.filter(
      (item) => String(item.status || "").trim().toLowerCase() === "em uso"
    ).length;

    if (equipamentosMetricTotal) equipamentosMetricTotal.textContent = String(items.length);
    if (equipamentosMetricDisponiveis) equipamentosMetricDisponiveis.textContent = String(disponiveis);
    if (equipamentosMetricEmUso) equipamentosMetricEmUso.textContent = String(emUso);
  }

  function updateAtribuicoesMetrics(atrRows, eqRows) {
    const atribuicoes = Array.isArray(atrRows) ? atrRows : [];
    const equipamentos = Array.isArray(eqRows) ? eqRows : [];
    const colaboradoresComItem = new Set(
      atribuicoes.map((item) => String(item.colaborador_nome || "").trim()).filter(Boolean)
    );
    const disponiveis = equipamentos.filter(
      (item) => String(item.status || "").trim().toLowerCase() === "disponivel"
    ).length;

    if (atribuicoesMetricAtivas) atribuicoesMetricAtivas.textContent = String(atribuicoes.length);
    if (atribuicoesMetricColaboradores) {
      atribuicoesMetricColaboradores.textContent = String(colaboradoresComItem.size);
    }
    if (atribuicoesMetricDisponiveis) {
      atribuicoesMetricDisponiveis.textContent = String(disponiveis);
    }
  }

  function updatePaginationState(currentPageRef, pageSize, totalItems, infoEl, prevBtn, nextBtn) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    let nextPage = Math.min(currentPageRef, totalPages);
    nextPage = Math.max(nextPage, 1);

    if (infoEl) infoEl.textContent = `Página ${nextPage} de ${totalPages}`;
    if (prevBtn) prevBtn.disabled = nextPage <= 1;
    if (nextBtn) nextBtn.disabled = nextPage >= totalPages;

    return { currentPage: nextPage, totalPages };
  }

  function updateServerPaginationState(currentPageRef, totalPages, infoEl, prevBtn, nextBtn) {
    const safeTotalPages = Math.max(1, Number(totalPages || 1));
    const safeCurrentPage = Math.min(Math.max(Number(currentPageRef || 1), 1), safeTotalPages);
    if (infoEl) infoEl.textContent = `Página ${safeCurrentPage} de ${safeTotalPages}`;
    if (prevBtn) prevBtn.disabled = safeCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = safeCurrentPage >= safeTotalPages;
    return { currentPage: safeCurrentPage, totalPages: safeTotalPages };
  }

  function scheduleRefresh(type, callback, delay = 220) {
    const timerKey =
      type === "colaboradores"
        ? "colaboradoresFilterTimer"
        : type === "equipamentos"
          ? "equipamentosFilterTimer"
          : "atribuicoesFilterTimer";
    window.clearTimeout(
      type === "colaboradores"
        ? colaboradoresFilterTimer
        : type === "equipamentos"
          ? equipamentosFilterTimer
          : atribuicoesFilterTimer
    );
    const nextTimer = window.setTimeout(callback, delay);
    if (timerKey === "colaboradoresFilterTimer") {
      colaboradoresFilterTimer = nextTimer;
      return;
    }
    if (timerKey === "equipamentosFilterTimer") {
      equipamentosFilterTimer = nextTimer;
      return;
    }
    atribuicoesFilterTimer = nextTimer;
  }

  function parseUrlPageNumber(value, fallback = 1) {
    const parsed = Number.parseInt(String(value || ""), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  function sanitizePageName(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return VALID_PAGE_NAMES.has(normalized) ? normalized : "dashboard";
  }

  function applyColaboradoresFiltersState(state = {}) {
    if (colaboradoresSearch) colaboradoresSearch.value = String(state.busca || "");
    if (colaboradoresDepartamentoFilter) {
      colaboradoresDepartamentoFilter.value = String(state.departamento || "").trim();
    }
    if (colaboradoresCargoFilter) colaboradoresCargoFilter.value = String(state.cargo || "");
    colaboradoresCurrentPage = parseUrlPageNumber(state.page, 1);
  }

  function applyEquipamentosFiltersState(state = {}) {
    if (eqBusca) eqBusca.value = String(state.busca || "");
    if (equipamentosSituacaoFilter) {
      equipamentosSituacaoFilter.value = state.situacao || "ativo";
    }
    if (equipamentosDisponibilidadeFilter) {
      equipamentosDisponibilidadeFilter.value = state.disponibilidade || "all";
    }
    equipamentosCurrentPage = parseUrlPageNumber(state.page, 1);
  }

  function applyAtribuicoesFiltersState(state = {}) {
    if (atribuicoesSearch) atribuicoesSearch.value = String(state.busca || "");
    if (atribuicoesStatusFilter) atribuicoesStatusFilter.value = state.status || "ativo";
    if (atribuicoesDataInicial) atribuicoesDataInicial.value = String(state.dataInicial || "");
    if (atribuicoesDataFinal) atribuicoesDataFinal.value = String(state.dataFinal || "");
    atribuicoesCurrentPage = parseUrlPageNumber(state.page, 1);
  }

  function resetColaboradoresFiltersState() {
    applyColaboradoresFiltersState({
      busca: "",
      departamento: "",
      cargo: "",
      page: 1,
    });
  }

  function resetEquipamentosFiltersState() {
    applyEquipamentosFiltersState({
      busca: "",
      situacao: "ativo",
      disponibilidade: "all",
      page: 1,
    });
  }

  function resetAtribuicoesFiltersState() {
    applyAtribuicoesFiltersState({
      busca: "",
      status: "ativo",
      dataInicial: "",
      dataFinal: "",
      page: 1,
    });
  }

  function getCurrentUrlState() {
    const params = new URLSearchParams(window.location.search);
    const view = sanitizePageName(params.get("view") || "dashboard");
    return {
      view,
      colaboradores: {
        busca:
          params.get("col_busca") ||
          (view === "colaboradores" ? params.get("busca") || "" : ""),
        departamento:
          params.get("col_departamento") ||
          params.get("col_setor") ||
          (view === "colaboradores" ? params.get("departamento") || params.get("setor") || "" : ""),
        cargo:
          params.get("col_cargo") ||
          (view === "colaboradores" ? params.get("cargo") || "" : ""),
        page: parseUrlPageNumber(
          params.get("col_page") || (view === "colaboradores" ? params.get("page") : null),
          1
        ),
      },
      equipamentos: {
        busca:
          params.get("eq_busca") ||
          (view === "equipamentos" ? params.get("busca") || "" : ""),
        situacao:
          params.get("eq_situacao") ||
          (view === "equipamentos" ? params.get("situacao") || "ativo" : "ativo"),
        disponibilidade:
          params.get("eq_disponibilidade") ||
          (view === "equipamentos" ? params.get("disponibilidade") || "all" : "all"),
        page: parseUrlPageNumber(
          params.get("eq_page") || (view === "equipamentos" ? params.get("page") : null),
          1
        ),
      },
      atribuicoes: {
        busca:
          params.get("at_busca") ||
          (view === "atribuicoes" ? params.get("busca") || "" : ""),
        status:
          params.get("at_status") ||
          (view === "atribuicoes" ? params.get("status") || "ativo" : "ativo"),
        dataInicial:
          params.get("at_data_inicial") ||
          (view === "atribuicoes" ? params.get("data_inicial") || "" : ""),
        dataFinal:
          params.get("at_data_final") ||
          (view === "atribuicoes" ? params.get("data_final") || "" : ""),
        page: parseUrlPageNumber(
          params.get("at_page") || (view === "atribuicoes" ? params.get("page") : null),
          1
        ),
      },
    };
  }

  function buildUrlFromCurrentState(view = currentPage) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set("view", sanitizePageName(view));

    const colState = {
      busca: String(colaboradoresSearch?.value || "").trim(),
      departamento: String(colaboradoresDepartamentoFilter?.value || "").trim(),
      cargo: String(colaboradoresCargoFilter?.value || "").trim(),
      page: colaboradoresCurrentPage,
    };

    if (colState.busca) params.set("col_busca", colState.busca);
    if (colState.departamento) params.set("col_departamento", colState.departamento);
    if (colState.cargo) params.set("col_cargo", colState.cargo);
    if (parseUrlPageNumber(colState.page, 1) > 1) params.set("col_page", String(colState.page));

    const eqState = {
      busca: String(eqBusca?.value || "").trim(),
      situacao: String(equipamentosSituacaoFilter?.value || "ativo").trim(),
      disponibilidade: String(equipamentosDisponibilidadeFilter?.value || "all").trim(),
      page: equipamentosCurrentPage,
    };

    if (eqState.busca) params.set("eq_busca", eqState.busca);
    if (eqState.situacao && eqState.situacao !== "ativo") params.set("eq_situacao", eqState.situacao);
    if (eqState.disponibilidade && eqState.disponibilidade !== "all") {
      params.set("eq_disponibilidade", eqState.disponibilidade);
    }
    if (parseUrlPageNumber(eqState.page, 1) > 1) params.set("eq_page", String(eqState.page));

    const atState = {
      busca: String(atribuicoesSearch?.value || "").trim(),
      status: String(atribuicoesStatusFilter?.value || "ativo").trim(),
      dataInicial: String(atribuicoesDataInicial?.value || "").trim(),
      dataFinal: String(atribuicoesDataFinal?.value || "").trim(),
      page: atribuicoesCurrentPage,
    };

    if (atState.busca) params.set("at_busca", atState.busca);
    if (atState.status && atState.status !== "ativo") params.set("at_status", atState.status);
    if (atState.dataInicial) params.set("at_data_inicial", atState.dataInicial);
    if (atState.dataFinal) params.set("at_data_final", atState.dataFinal);
    if (parseUrlPageNumber(atState.page, 1) > 1) params.set("at_page", String(atState.page));

    if (view === "colaboradores") {
      if (colState.busca) params.set("busca", colState.busca);
      if (colState.departamento) params.set("departamento", colState.departamento);
      if (colState.cargo) params.set("cargo", colState.cargo);
      if (parseUrlPageNumber(colState.page, 1) > 1) params.set("page", String(colState.page));
    }

    if (view === "equipamentos") {
      if (eqState.busca) params.set("busca", eqState.busca);
      if (eqState.situacao && eqState.situacao !== "ativo") params.set("situacao", eqState.situacao);
      if (eqState.disponibilidade && eqState.disponibilidade !== "all") {
        params.set("disponibilidade", eqState.disponibilidade);
      }
      if (parseUrlPageNumber(eqState.page, 1) > 1) params.set("page", String(eqState.page));
    }

    if (view === "atribuicoes") {
      if (atState.busca) params.set("busca", atState.busca);
      if (atState.status && atState.status !== "ativo") params.set("status", atState.status);
      if (atState.dataInicial) params.set("data_inicial", atState.dataInicial);
      if (atState.dataFinal) params.set("data_final", atState.dataFinal);
      if (parseUrlPageNumber(atState.page, 1) > 1) params.set("page", String(atState.page));
    }

    url.search = params.toString();
    return `${url.pathname}${url.search}`;
  }

  function syncUrlState({ view = currentPage, replace = true } = {}) {
    if (isApplyingUrlState) return;
    const nextUrl = buildUrlFromCurrentState(view);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl === currentUrl) return;

    const state = { view: sanitizePageName(view) };
    if (replace) {
      window.history.replaceState(state, "", nextUrl);
      return;
    }

    window.history.pushState(state, "", nextUrl);
  }

  function hydrateStateFromUrl() {
    isApplyingUrlState = true;
    const state = getCurrentUrlState();
    applyColaboradoresFiltersState(state.colaboradores);
    applyEquipamentosFiltersState(state.equipamentos);
    applyAtribuicoesFiltersState(state.atribuicoes);
    isApplyingUrlState = false;
    updateFilterSummary();
    return state;
  }

  function buildColaboradoresQuery(page = 1) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(colaboradoresPageSize));

    const q = String(colaboradoresSearch?.value || "").trim();
    const departamento = String(colaboradoresDepartamentoFilter?.value || "").trim();
    const cargo = String(colaboradoresCargoFilter?.value || "").trim();

    if (q) params.set("q", q);
    if (departamento) params.set("departamento", departamento);
    if (cargo) params.set("cargo", cargo);

    return params.toString();
  }

  function buildEquipamentosQuery(page = 1) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(equipamentosPageSize));

    const q = String(eqBusca?.value || "").trim();
    const situacao = String(equipamentosSituacaoFilter?.value || "ativo").trim();
    const disponibilidade = String(equipamentosDisponibilidadeFilter?.value || "all").trim();

    if (q) params.set("q", q);
    if (situacao) params.set("situacao", situacao);
    if (disponibilidade && disponibilidade !== "all") params.set("disponibilidade", disponibilidade);

    return params.toString();
  }

  function buildAtribuicoesQuery(page = 1) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(atribuicoesPageSize));

    const q = String(atribuicoesSearch?.value || "").trim();
    const status = String(atribuicoesStatusFilter?.value || "ativo").trim();
    const dataInicial = String(atribuicoesDataInicial?.value || "").trim();
    const dataFinal = String(atribuicoesDataFinal?.value || "").trim();

    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (dataInicial) params.set("data_inicial", dataInicial);
    if (dataFinal) params.set("data_final", dataFinal);

    return params.toString();
  }

  function getFilteredColaboradores() {
    return colaboradoresCache;
  }

  function getFilteredEquipamentos() {
    return equipamentosCache;
  }

  function getFilteredAtribuicoes() {
    return atribuicoesCache;
  }

  function applyColaboradoresView() {
    const rows = getFilteredColaboradores();
    const pagination = updateServerPaginationState(
      colaboradoresCurrentPage,
      colaboradoresTotalPages,
      colaboradoresPageInfo,
      colaboradoresPrevBtn,
      colaboradoresNextBtn
    );
    colaboradoresCurrentPage = pagination.currentPage;
    colaboradoresTotalPages = pagination.totalPages;
    renderColaboradores(rows);
  }

  function renderEquipamentos(rows) {
    equipamentosTbody.innerHTML = "";
    if (!rows || !rows.length) {
      const hasFilters = countEquipamentosActiveFilters() > 0;
      renderEmptyRow(
        equipamentosTbody,
        8,
        hasFilters ? "Nenhum resultado encontrado" : "Nenhum equipamento encontrado",
        hasFilters
          ? "Nenhum resultado encontrado para os filtros aplicados."
          : "Ajuste o filtro ou cadastre um novo equipamento para começar."
      );
      return;
    }
    const canManage = canManageCriticalData();
    for (const r of rows || []) {
      const isEmUso = String(r.status || "").trim().toLowerCase() === "em uso";
      const isInativo = String(r.situacao || "ativo").trim().toLowerCase() === "inativo";
      const parsedValor = parseValorEquipamento(r.valor);
      const valorLabel =
        parsedValor != null && Number.isFinite(parsedValor) ? formatNumberToBrl(parsedValor) : "—";
      const editDisabledAttr = !canManage
        ? 'disabled title="Permissão insuficiente"'
        : isInativo
          ? 'disabled title="Equipamentos inativos não podem ser editados"'
          : "";
      const inativarDisabledAttr = isEmUso
        ? 'disabled title="Devolva o equipamento antes de inativar"'
        : !canManage
          ? 'disabled title="Permissão insuficiente"'
          : isInativo
          ? 'disabled title="Equipamento já está inativo"'
          : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="saas-colab-person">
            <span class="saas-colab-avatar is-equipment">${escapeHtml(getNameInitials(r.nome))}</span>
            <div class="saas-colab-person-copy">
              <div class="saas-cell-title">${escapeHtml(r.nome)}</div>
              <div class="table-subtext">ID interno #${escapeHtml(r.id)}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="eq-serial">
            <div class="serial-code">${escapeHtml(r.serial || "—")}</div>
            <div class="serial-sub">· Serial único</div>
          </div>
        </td>
        <td>
          <div class="saas-table-stack">
            <span class="badge light badge-brand">${escapeHtml(r.modelo || "—")}</span>
          </div>
        </td>
        <td>
          <div class="saas-table-stack">
            <span class="badge light badge-brand">${escapeHtml(r.marca)}</span>
          </div>
        </td>
        <td>
          <div class="saas-table-stack">
            <span class="saas-code code">${escapeHtml(valorLabel)}</span>
            <span class="table-subtext">Valor do ativo</span>
          </div>
        </td>
        <td>
          <div class="saas-table-stack">
            <span class="saas-code code">${escapeHtml(r.codigo_barras)}</span>
            <span class="table-subtext">Código automático</span>
          </div>
        </td>
        <td>${statusBadge(r.status)}</td>
        <td>
          <div class="saas-table-actions">
            <button
              class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action"
              type="button"
              data-action="editar-equipamento"
              data-equipamento-id="${r.id}"
              ${editDisabledAttr}
            >
              Editar
            </button>
            <button
              class="saas-btn saas-btn-sm saas-btn-action saas-btn-danger"
              type="button"
              data-action="inativar-equipamento"
              data-equipamento-id="${r.id}"
              data-equipamento-nome="${escapeHtml(r.nome)}"
              ${inativarDisabledAttr}
            >
              Inativar
            </button>
          </div>
        </td>
      `;
      highlightRowIfNeeded(tr, "equipamentos", r.id);
      equipamentosTbody.appendChild(tr);
    }
  }

  function renderAtribuicoes(rows) {
    atribuicoesTbody.innerHTML = "";
    if (!rows || !rows.length) {
      const hasFilters = countAtribuicoesActiveFilters() > 0;
      renderEmptyRow(
        atribuicoesTbody,
        4,
        hasFilters ? "Nenhum resultado encontrado" : "Nenhuma atribuição encontrada",
        hasFilters
          ? "Nenhum resultado encontrado para os filtros aplicados."
          : "Ajuste os filtros ou clique em 'Nova atribuição'."
      );
      return;
    }
    const groups = new Map();
    for (const r of rows || []) {
      const colId = Number(r.colaborador_id || 0);
      const key = colId > 0 ? String(colId) : String(r.colaborador_nome || "");
      if (!groups.has(key)) {
        groups.set(key, {
          colaborador_id: colId,
          colaborador_nome: String(r.colaborador_nome || "—"),
          latest: r.data_atribuicao || null,
          items: [],
          hasActive: false,
          highlightId: r.id,
        });
      }
      const g = groups.get(key);
      g.items.push({
        id: r.id,
        status: r.status,
        data_atribuicao: r.data_atribuicao,
        data_devolucao: r.data_devolucao,
        equipamento_id: r.equipamento_id,
        equipamento_nome: r.equipamento_nome,
        codigo_barras: r.codigo_barras,
        serial: r.serial,
        modelo: r.modelo,
      });
      const ts = new Date(String(r.data_atribuicao || "")).getTime();
      const cur = g.latest ? new Date(String(g.latest)).getTime() : 0;
      if (Number.isFinite(ts) && ts > cur) g.latest = r.data_atribuicao;
      if (String(r.status || "").trim().toLowerCase() === "ativo") g.hasActive = true;
      if (r.id && Number(r.id) > Number(g.highlightId || 0)) g.highlightId = r.id;
    }

    const list = Array.from(groups.values()).sort((a, b) =>
      String(b.latest || "").localeCompare(String(a.latest || ""))
    );

    for (const g of list) {
      const latestLabel = g.latest ? formatDateLabel(g.latest) : "—";
      const activeCount = g.items.filter((x) => String(x.status || "").trim().toLowerCase() === "ativo").length;
      const totalCount = g.items.length;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="saas-colab-person">
            <span class="saas-colab-avatar">${escapeHtml(getNameInitials(g.colaborador_nome))}</span>
            <div class="saas-colab-person-copy">
              <div class="saas-cell-title">${escapeHtml(g.colaborador_nome)}</div>
              <div class="table-subtext">${escapeHtml(
                activeCount > 0
                  ? `${activeCount} ativo(s) • ${totalCount} no total`
                  : `${totalCount} registro(s)`
              )}</div>
            </div>
          </div>
        </td>
        <td>
          <button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="toggle-atribuicoes" data-colaborador-key="${escapeHtml(
            String(g.colaborador_id || g.colaborador_nome)
          )}">
            Ver atribuições
          </button>
        </td>
        <td>
          <div class="saas-table-stack">
            <span class="saas-badge info">${escapeHtml(latestLabel)}</span>
            <span class="table-subtext">${escapeHtml(g.latest ? relativeTime(g.latest) : "")}</span>
          </div>
        </td>
        <td>${g.hasActive ? statusBadge("ativo") : statusBadge("finalizado")}</td>
      `;

      const detailsTr = document.createElement("tr");
      detailsTr.className = "atribuicoes-details-row";
      detailsTr.dataset.colaboradorKey = String(g.colaborador_id || g.colaborador_nome);
      detailsTr.hidden = true;
      const itemsHtml = g.items
        .slice()
        .sort((a, b) => String(b.data_atribuicao || "").localeCompare(String(a.data_atribuicao || "")))
        .map((it) => {
          const isAtiva = String(it.status || "").trim().toLowerCase() === "ativo";
          const action = isAtiva
            ? `<button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="devolver" data-equipamento-id="${escapeHtml(
                it.equipamento_id
              )}" data-colaborador-nome="${escapeHtml(
                g.colaborador_nome
              )}" data-equipamento-nome="${escapeHtml(String(it.equipamento_nome || ""))}">Devolver</button>`
            : statusBadge("finalizado");
          const statusClass = isAtiva ? "ativo" : "finalizado";
          const statusLabel = isAtiva ? "Ativo" : "Finalizado";
          const dateLabel = formatDateLabel(it.data_atribuicao);
          return `
            <div class="atrib-grid-row">
              <div class="atrib-cell atrib-item">
                <div class="saas-table-stack">
                  <div class="saas-cell-title">${escapeHtml(String(it.equipamento_nome || "—"))}</div>
                  <span class="table-subtext">
                    <span class="saas-code">${escapeHtml(String(it.codigo_barras || "—"))}</span>
                    <span>•</span>
                    <span>ID #${escapeHtml(String(it.equipamento_id || "—"))}</span>
                  </span>
                </div>
              </div>
              <div class="atrib-cell attrib-serial"><span class="saas-code">${escapeHtml(String(it.serial || "—"))}</span></div>
              <div class="atrib-cell attrib-modelo"><span class="badge light badge-brand">${escapeHtml(String(it.modelo || "—"))}</span></div>
              <div class="atrib-cell attrib-data"><span class="saas-badge info">${escapeHtml(dateLabel)}</span></div>
              <div class="atrib-cell attrib-status"><span class="status ${statusClass}">${escapeHtml(statusLabel)}</span></div>
              <div class="atrib-cell attrib-actions">${action}</div>
            </div>
          `;
        })
        .join("");

      detailsTr.innerHTML = `
        <td colspan="4">
          <div class="atribuicoes-details">
            <div class="atrib-grid">
              <div class="atrib-grid-head">
                <div class="atrib-grid-row is-head">
                  <div class="atrib-cell">Item</div>
                  <div class="atrib-cell">Serial</div>
                  <div class="atrib-cell">Modelo</div>
                  <div class="atrib-cell">Data</div>
                  <div class="atrib-cell">Status</div>
                  <div class="atrib-cell">Ações</div>
                </div>
              </div>
              <div class="atrib-grid-body">
                ${itemsHtml}
              </div>
            </div>
          </div>
        </td>
      `;

      highlightRowIfNeeded(tr, "atribuicoes", g.highlightId);
      atribuicoesTbody.appendChild(tr);
      atribuicoesTbody.appendChild(detailsTr);
    }
  }

  function applyEquipamentosView() {
    const rows = getFilteredEquipamentos();
    const pagination = updateServerPaginationState(
      equipamentosCurrentPage,
      equipamentosTotalPages,
      equipamentosPageInfo,
      equipamentosPrevBtn,
      equipamentosNextBtn
    );
    equipamentosCurrentPage = pagination.currentPage;
    equipamentosTotalPages = pagination.totalPages;
    renderEquipamentos(rows);
  }

  function applyAtribuicoesView() {
    const rows = getFilteredAtribuicoes();
    const pagination = updateServerPaginationState(
      atribuicoesCurrentPage,
      atribuicoesTotalPages,
      atribuicoesPageInfo,
      atribuicoesPrevBtn,
      atribuicoesNextBtn
    );
    atribuicoesCurrentPage = pagination.currentPage;
    atribuicoesTotalPages = pagination.totalPages;
    renderAtribuicoes(rows);
  }

  function renderUsuarios(rows) {
    if (!usuariosTbody) return;
    usuariosTbody.innerHTML = "";
    if (!rows || !rows.length) {
      renderEmptyRow(
        usuariosTbody,
        4,
        "Nenhum usuário encontrado",
        "Não há usuários disponíveis para gerenciamento no momento."
      );
      return;
    }

    let currentUserId = 0;
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_KEY));
      currentUserId = Number(parsed?.id || 0);
    } catch {
      currentUserId = 0;
    }
    const isAdminSession = isAdminUser();

    for (const u of rows) {
      const perfil = String(u.perfil || "").trim().toLowerCase();
      const isAdmin = perfil === "admin";
      const isSelf = Number(u.id) === Number(currentUserId) && currentUserId > 0;
      const nextPerfil = isAdmin ? "operador" : "admin";
      const actionLabel = isAdmin ? "Remover admin" : "Tornar admin";
      const actionClass = isAdmin ? "saas-btn-danger" : "primary";
      const shouldHideAction = isSelf || !isAdminSession;
      const disabledAttr = shouldHideAction ? 'disabled aria-disabled="true"' : "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="saas-cell-title">${escapeHtml(u.nome || "—")}</div></td>
        <td><span class="saas-code">${escapeHtml(u.usuario || "—")}</span></td>
        <td>${perfilBadge(u.perfil)}</td>
        <td>
          <div class="saas-table-actions">
            ${
              shouldHideAction
                ? actionStateBadge(isSelf ? "self" : "")
                : `<button
                    class="saas-btn saas-btn-sm saas-btn-action ${actionClass}"
                    type="button"
                    data-action="toggle-user-perfil"
                    data-user-id="${escapeHtml(u.id)}"
                    data-next-perfil="${escapeHtml(nextPerfil)}"
                    data-user-nome="${escapeHtml(u.nome || u.usuario || "usuário")}"
                    ${disabledAttr}
                  >
                    ${escapeHtml(actionLabel)}
                  </button>`
            }
          </div>
        </td>
      `;
      usuariosTbody.appendChild(tr);
    }
  }

  function renderOrganizacao() {
    if (!organizacaoTbody) return;
    organizacaoTbody.innerHTML = "";

    const deps = Array.isArray(departamentosCache) ? departamentosCache : [];
    const cargos = Array.isArray(cargosCache) ? cargosCache : [];

    if (!deps.length) {
      renderEmptyRow(
        organizacaoTbody,
        3,
        "Nenhum departamento encontrado",
        "Crie departamentos pelo cadastro de colaboradores ou nesta tela com “+ Novo departamento”."
      );
      return;
    }

    const cargosByDep = new Map();
    cargos.forEach((c) => {
      const depId = Number(c.departamento_id || 0);
      if (!Number.isInteger(depId) || depId <= 0) return;
      if (!cargosByDep.has(depId)) cargosByDep.set(depId, []);
      cargosByDep.get(depId).push(c);
    });

    deps.forEach((d) => {
      const depId = Number(d.id);
      const list = (cargosByDep.get(depId) || []).slice().sort((a, b) =>
        String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR")
      );

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="saas-table-stack">
            <div class="saas-cell-title">${escapeHtml(d.nome || "—")}</div>
            <span class="table-subtext">ID #${escapeHtml(d.id)}</span>
          </div>
        </td>
        <td>
          <span class="saas-badge info">${escapeHtml(pluralize(list.length, "cargo", "cargos"))}</span>
        </td>
        <td>
          <div class="saas-table-actions">
            <button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="toggle-dep-cargos" data-dep-id="${escapeHtml(
              d.id
            )}">
              Ver cargos
            </button>
            <button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="create-cargo" data-dep-id="${escapeHtml(
              d.id
            )}">
              + Novo cargo
            </button>
            <button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="dep-actions" data-dep-id="${escapeHtml(
              d.id
            )}" title="Ações" aria-label="Ações">
              Ações ▾
            </button>
          </div>
        </td>
      `;

      const detailsTr = document.createElement("tr");
      detailsTr.className = "atribuicoes-details-row";
      detailsTr.dataset.depId = String(d.id);
      detailsTr.hidden = true;

      const itemsHtml = list
        .map((c) => {
          const shouldHighlight = Number(pendingCargoHighlightId) === Number(c.id);
          return `
            <div class="atribuicoes-details-item ${shouldHighlight ? "saas-row-highlight" : ""}" data-cargo-id="${escapeHtml(
              String(c.id || "")
            )}">
              <div class="atribuicoes-details-main">
                <div class="saas-cell-title">${escapeHtml(String(c.nome || "—"))}</div>
                <div class="table-subtext">Cargo • ID #${escapeHtml(String(c.id || ""))}</div>
              </div>
              <div class="atribuicoes-details-action">
                <button class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action" type="button" data-action="cargo-actions" data-cargo-id="${escapeHtml(
                  String(c.id || "")
                )}" data-dep-id="${escapeHtml(String(d.id || ""))}" title="Ações" aria-label="Ações">
                  Ações ▾
                </button>
              </div>
            </div>
          `;
        })
        .join("");

      detailsTr.innerHTML = `
        <td colspan="3">
          <div class="atribuicoes-details">
            ${itemsHtml || `<div class="table-subtext">Nenhum cargo neste departamento.</div>`}
          </div>
        </td>
      `;

      highlightRowIfNeeded(tr, "organizacao", d.id);
      organizacaoTbody.appendChild(tr);
      organizacaoTbody.appendChild(detailsTr);
    });

    if (pendingCargoHighlightId != null) {
      const el = organizacaoTbody.querySelector(`[data-cargo-id="${CSS.escape(String(pendingCargoHighlightId))}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      pendingCargoHighlightId = null;
    }
  }

  function renderUnidades() {
    if (!unidadesTbody) return;
    unidadesTbody.innerHTML = "";

    const list = Array.isArray(unidadesCache) ? unidadesCache : [];
    if (!list.length) {
      renderEmptyRow(
        unidadesTbody,
        4,
        "Nenhuma unidade encontrada",
        "Crie unidades para começar a padronizar o cadastro de colaboradores."
      );
      return;
    }

    for (const u of list) {
      const tr = document.createElement("tr");
      const titulo = formatUnidadeDisplayLabel(u);
      const tipo = String(u.tipo || "—");
      const cidade = String(u.cidade || "").trim();
      const estado = String(u.estado || "").trim();
      const local = cidade && estado ? `${cidade}/${estado}` : cidade || estado || "—";

      tr.innerHTML = `
        <td>
          <div class="saas-table-stack">
            <div class="saas-cell-title">${escapeHtml(titulo)}</div>
            <span class="table-subtext">ID #${escapeHtml(String(u.id || ""))}</span>
          </div>
        </td>
        <td><span class="saas-badge info">${escapeHtml(tipo)}</span></td>
        <td><span class="saas-code">${escapeHtml(local)}</span></td>
        <td>
          <div class="saas-table-actions">
            <button
              class="saas-btn saas-btn-ghost saas-btn-sm saas-btn-action"
              type="button"
              data-action="unidade-actions"
              data-unidade-id="${escapeHtml(String(u.id || ""))}"
              title="Ações"
              aria-label="Ações"
            >
              Ações ▾
            </button>
          </div>
        </td>
      `;
      highlightRowIfNeeded(tr, "unidades", u.id);
      unidadesTbody.appendChild(tr);
    }
  }

  async function loadOrganizacaoPage() {
    showMsg("");
    renderLoadingRow(organizacaoTbody, 3, "Carregando departamentos e cargos...");
    try {
      const [deps, cargos] = await Promise.all([request("/departamentos"), request("/cargos")]);
      departamentosCache = Array.isArray(deps) ? deps : [];
      cargosCache = Array.isArray(cargos) ? cargos : [];
      renderOrganizacao();
    } catch (err) {
      renderEmptyRow(
        organizacaoTbody,
        3,
        "Não foi possível carregar",
        "Verifique a conexão com o servidor e tente novamente."
      );
      showMsg(err.message || "Falha ao carregar departamentos e cargos");
    }
  }

  async function loadUnidadesPage() {
    showMsg("");
    if (unidadesTbody) renderLoadingRow(unidadesTbody, 4, "Carregando unidades...");
    try {
      const unidades = await request("/unidades");
      unidadesCache = Array.isArray(unidades) ? unidades : [];
      renderUnidades();
    } catch (err) {
      if (unidadesTbody) {
        renderEmptyRow(
          unidadesTbody,
          4,
          "Não foi possível carregar",
          "Verifique a conexão com o servidor e tente novamente."
        );
      }
      showMsg(err.message || "Falha ao carregar unidades");
    }
  }

  function formatBrlRelatorio(n) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);
  }

  function getRelatorioChartTheme() {
    const cs = getComputedStyle(document.documentElement);
    return {
      text: (cs.getPropertyValue("--text") || "#101828").trim(),
      muted: (cs.getPropertyValue("--muted") || "#667085").trim(),
      border: (cs.getPropertyValue("--border") || "#e4e7ec").trim(),
    };
  }

  function destroyRelatoriosCharts() {
    if (chartRelatorioDept) {
      chartRelatorioDept.destroy();
      chartRelatorioDept = null;
    }
    if (chartRelatorioStatus) {
      chartRelatorioStatus.destroy();
      chartRelatorioStatus = null;
    }
  }

  function renderRelatoriosCharts(data) {
    if (typeof Chart === "undefined" || !relatorioChartDepartamentosEl || !relatorioChartStatusEl) return;
    const theme = getRelatorioChartTheme();
    destroyRelatoriosCharts();

    const porDepartamento = Array.isArray(data?.porDepartamento) ? data.porDepartamento : [];
    const porStatus = Array.isArray(data?.porStatus) ? data.porStatus : [];

    const deptRows = porDepartamento.filter((r) => Number(r.total_valor) > 0);
    const deptLabels = deptRows.length ? deptRows.map((r) => String(r.departamento_nome || "—")) : ["Sem atribuições"];
    const deptValues = deptRows.length ? deptRows.map((r) => Number(r.total_valor)) : [0];

    chartRelatorioDept = new Chart(relatorioChartDepartamentosEl, {
      type: "bar",
      data: {
        labels: deptLabels,
        datasets: [
          {
            label: "Valor",
            data: deptValues,
            backgroundColor: "rgba(79, 124, 255, 0.5)",
            borderColor: "rgba(79, 124, 255, 0.95)",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => formatBrlRelatorio(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            ticks: { color: theme.muted, maxRotation: 40, minRotation: 0 },
            grid: { color: theme.border, drawBorder: false },
          },
          y: {
            ticks: {
              color: theme.muted,
              callback: (v) => formatBrlRelatorio(v),
            },
            grid: { color: theme.border },
          },
        },
      },
    });

    function labelStatus(s) {
      const x = String(s || "").trim().toLowerCase();
      if (x === "disponivel") return "Disponível";
      if (x === "em uso") return "Em uso";
      return String(s || "—");
    }

    const statusRows = porStatus.filter((r) => Number(r.total_valor) > 0);
    const statusLabels = statusRows.length ? statusRows.map((r) => labelStatus(r.status)) : ["Sem valor"];
    const statusValues = statusRows.length ? statusRows.map((r) => Number(r.total_valor)) : [0];
    const statusColors = statusRows.length
      ? statusRows.map((r) => {
          const x = String(r.status || "").trim().toLowerCase();
          if (x === "disponivel") return "rgba(16, 185, 129, 0.75)";
          if (x === "em uso") return "rgba(79, 124, 255, 0.75)";
          return "rgba(148, 163, 184, 0.65)";
        })
      : ["rgba(148, 163, 184, 0.35)"];

    chartRelatorioStatus = new Chart(relatorioChartStatusEl, {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [
          {
            data: statusValues,
            backgroundColor: statusColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: theme.muted, padding: 12, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => formatBrlRelatorio(ctx.raw),
            },
          },
        },
      },
    });
  }

  function setupRelatoriosThemeObserver() {
    if (relatoriosThemeObserver) return;
    relatoriosThemeObserver = new MutationObserver(() => {
      if (currentPage !== "relatorios" || !relatoriosDataCache) return;
      renderRelatoriosCharts(relatoriosDataCache);
    });
    relatoriosThemeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  async function loadRelatoriosPage() {
    showMsg("");
    if (relatorioTotalInvestidoEl) relatorioTotalInvestidoEl.textContent = "…";
    if (relatorioValorEmUsoEl) relatorioValorEmUsoEl.textContent = "…";
    if (relatorioValorDisponivelEl) relatorioValorDisponivelEl.textContent = "…";
    try {
      const [resumo, porDepartamento, porStatus] = await Promise.all([
        request("/relatorios/resumo"),
        request("/relatorios/por-departamento"),
        request("/relatorios/por-status"),
      ]);
      relatoriosDataCache = { resumo, porDepartamento, porStatus };
      if (relatorioTotalInvestidoEl) {
        relatorioTotalInvestidoEl.textContent = formatBrlRelatorio(resumo?.total_valor);
      }
      if (relatorioValorEmUsoEl) {
        relatorioValorEmUsoEl.textContent = formatBrlRelatorio(resumo?.valor_em_uso);
      }
      if (relatorioValorDisponivelEl) {
        relatorioValorDisponivelEl.textContent = formatBrlRelatorio(resumo?.valor_disponivel);
      }
      renderRelatoriosCharts(relatoriosDataCache);
    } catch (err) {
      relatoriosDataCache = null;
      if (relatorioTotalInvestidoEl) relatorioTotalInvestidoEl.textContent = "—";
      if (relatorioValorEmUsoEl) relatorioValorEmUsoEl.textContent = "—";
      if (relatorioValorDisponivelEl) relatorioValorDisponivelEl.textContent = "—";
      destroyRelatoriosCharts();
      showMsg(err.message || "Falha ao carregar relatórios");
    }
  }

  async function createDepartamentoFromOrganizacao() {
    if (!canManageCriticalData()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    const nome = await showPromptModal({
      title: "Novo departamento",
      message: "Informe o nome do departamento.",
      initialValue: "",
      placeholder: "Ex: TI",
      confirmText: "Criar",
      cancelText: "Cancelar",
    });
    if (nome == null) return;
    const trimmed = String(nome || "").trim();
    if (!trimmed) {
      await showAlertModal({ title: "Nome inválido", message: "O nome do departamento não pode ser vazio." });
      return;
    }
    showMsg("");
    try {
      if (organizacaoNewDepartamentoBtn) setButtonLoading(organizacaoNewDepartamentoBtn, true, "Criando...");
      const created = await request("/departamentos", { method: "POST", body: { nome: normalizeTextCase(trimmed) } });
      pendingRowHighlight.organizacao = created?.id ?? null;
      showMsg("Departamento criado com sucesso.", "success");
      await loadOrganizacaoPage();
      await loadDepartamentos({ preserveSelection: true });
    } catch (err) {
      await showAlertModal({
        title: "Não foi possível criar",
        message: err.message || "Falha ao criar departamento",
      });
    } finally {
      if (organizacaoNewDepartamentoBtn) setButtonLoading(organizacaoNewDepartamentoBtn, false);
    }
  }

  async function loadUsuarios() {
    showMsg("");
    if (!usuariosTbody) return;
    if (!canManageUsers()) {
      renderEmptyRow(
        usuariosTbody,
        4,
        "Acesso restrito",
        "Somente administradores podem gerenciar usuários."
      );
      return;
    }

    renderLoadingRow(usuariosTbody, 4, "Carregando usuários...");
    try {
      const users = await request("/usuarios");
      renderUsuarios(Array.isArray(users) ? users : []);
    } catch (err) {
      renderEmptyRow(
        usuariosTbody,
        4,
        "Não foi possível carregar",
        "Os usuários não puderam ser consultados agora. Tente novamente em instantes."
      );
      showMsg(err.message || "Falha ao carregar usuários");
    }
  }

  async function loadColaboradores() {
    showMsg("");
    renderLoadingRow(colaboradoresTbody, 5, "Carregando colaboradores...");
    try {
      const [metricsRows, paginated] = await Promise.all([
        request("/colaboradores"),
        request(`/colaboradores?${buildColaboradoresQuery(colaboradoresCurrentPage)}`),
      ]);
      const metrics = Array.isArray(metricsRows) ? metricsRows : metricsRows?.items || [];
      const items = Array.isArray(paginated) ? paginated : paginated?.items || [];
      const pagination = paginated?.pagination || {
        page: 1,
        totalPages: 1,
      };
      await refreshColaboradoresFilterDropdowns(metrics);
      updateColaboradoresMetrics(metrics);
      await loadDepartamentos({ preserveSelection: true });
      const depColab = departamentoSelect?.value
        ? Number(departamentoSelect.value)
        : null;
      await loadCargosForDepartamento(depColab, { preserveSelection: true });
      colaboradoresCache = items;
      colaboradoresCurrentPage = Number(pagination.page || 1);
      colaboradoresTotalPages = Number(pagination.totalPages || 1);
      colaboradoresResultsTotal = Number(pagination.total || items.length || 0);
      applyColaboradoresView();
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        colaboradoresTbody,
        5,
        "Não foi possível carregar",
        "Verifique a conexão com o servidor e tente novamente."
      );
      updateColaboradoresMetrics([]);
      colaboradoresResultsTotal = 0;
      updateFilterSummary();
      updateServerPaginationState(
        1,
        1,
        colaboradoresPageInfo,
        colaboradoresPrevBtn,
        colaboradoresNextBtn
      );
      showMsg(err.message || "Falha ao carregar colaboradores");
      throw err;
    }
  }

  async function loadColaboradoresListPage(page = 1, direction = null) {
    showMsg("");
    try {
      const response = await request(`/colaboradores?${buildColaboradoresQuery(page)}`);
      colaboradoresCache = Array.isArray(response) ? response : response?.items || [];
      colaboradoresCurrentPage = Number(response?.pagination?.page || page || 1);
      colaboradoresTotalPages = Number(response?.pagination?.totalPages || 1);
      colaboradoresResultsTotal = Number(response?.pagination?.total || colaboradoresCache.length || 0);

      if (direction) {
        animateListTransition(colaboradoresTableWrap, direction, () => applyColaboradoresView());
      } else {
        applyColaboradoresView();
      }
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        colaboradoresTbody,
        3,
        "Não foi possível carregar",
        "Os colaboradores não puderam ser filtrados agora. Tente novamente em instantes."
      );
      colaboradoresResultsTotal = 0;
      updateFilterSummary();
      updateServerPaginationState(1, 1, colaboradoresPageInfo, colaboradoresPrevBtn, colaboradoresNextBtn);
      showMsg(err.message || "Falha ao carregar colaboradores");
    }
  }

  async function loadEquipamentos() {
    showMsg("");
    renderLoadingRow(equipamentosTbody, 8, "Carregando equipamentos...");
    try {
      const [metricsRows, paginated] = await Promise.all([
        request("/equipamentos"),
        request(`/equipamentos?${buildEquipamentosQuery(equipamentosCurrentPage)}`),
      ]);

      const metrics = Array.isArray(metricsRows) ? metricsRows : metricsRows?.items || [];
      const items = Array.isArray(paginated) ? paginated : paginated?.items || [];
      const pagination = paginated?.pagination || {
        page: 1,
        totalPages: 1,
      };

      updateEquipamentosMetrics(metrics);
      equipamentosCache = items;
      equipamentosCurrentPage = Number(pagination.page || 1);
      equipamentosTotalPages = Number(pagination.totalPages || 1);
      equipamentosResultsTotal = Number(pagination.total || items.length || 0);
      applyEquipamentosView();
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        equipamentosTbody,
        8,
        "Não foi possível carregar",
        "Verifique a conexão com o servidor e tente novamente."
      );
      updateEquipamentosMetrics([]);
      equipamentosResultsTotal = 0;
      updateFilterSummary();
      updateServerPaginationState(
        1,
        1,
        equipamentosPageInfo,
        equipamentosPrevBtn,
        equipamentosNextBtn
      );
      showMsg(err.message || "Falha ao carregar equipamentos");
      throw err;
    }
  }

  function syncAtribEquipamentoUI() {
    if (!atribEquipamento || !atribEquipamentoList) return;
    const selected = Array.from(atribEquipamento.selectedOptions || []);
    atribEquipamentoList.querySelectorAll(".atrib-equip-row").forEach((row) => {
      const id = String(row.dataset.equipId || "");
      const cb = row.querySelector(".atrib-equip-checkbox");
      const isOn = selected.some((o) => String(o.value) === id);
      if (cb) cb.checked = isOn;
      row.classList.toggle("is-selected", isOn);
    });

    if (atribEquipamentoTags) {
      atribEquipamentoTags.innerHTML = "";
      selected.forEach((opt) => {
        const name = String(opt.textContent || "").trim();
        const id = String(opt.value);
        const tag = document.createElement("span");
        tag.className = "atrib-equip-tag";
        const textSpan = document.createElement("span");
        textSpan.className = "atrib-equip-tag-text";
        textSpan.textContent = name;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "atrib-equip-tag-remove";
        btn.dataset.removeEquip = id;
        btn.setAttribute("aria-label", `Remover ${name}`);
        btn.textContent = "×";
        tag.appendChild(textSpan);
        tag.appendChild(btn);
        atribEquipamentoTags.appendChild(tag);
      });
    }

    const selectedCount = selected.length;
    const rowCount = atribEquipamentoList.querySelectorAll(".atrib-equip-row").length;
    if (atribEquipamentoSelectedWrap) {
      atribEquipamentoSelectedWrap.hidden = selectedCount === 0;
    }
    if (atribEquipamentoPlaceholder) {
      if (rowCount === 0) {
        atribEquipamentoPlaceholder.hidden = false;
        atribEquipamentoPlaceholder.textContent = "Nenhum equipamento disponível no momento.";
      } else if (selectedCount === 0) {
        atribEquipamentoPlaceholder.hidden = false;
        atribEquipamentoPlaceholder.textContent = "Selecione um ou mais equipamentos";
      } else {
        atribEquipamentoPlaceholder.hidden = true;
      }
    }
    if (atribEquipamentoPicker) {
      atribEquipamentoPicker.classList.toggle("has-selection", selectedCount > 0);
    }
  }

  function renderAtribEquipamentoChecklist(eqRows) {
    if (!atribEquipamento || !atribEquipamentoList) return;
    atribEquipamento.innerHTML = "";
    atribEquipamentoList.innerHTML = "";
    const disponiveis = (eqRows || []).filter((x) => x.status === "disponivel");
    for (const e of disponiveis) {
      const opt = document.createElement("option");
      opt.value = String(e.id);
      opt.textContent = `${e.nome} (${e.codigo_barras})`;
      atribEquipamento.appendChild(opt);

      const row = document.createElement("label");
      row.className = "atrib-equip-row";
      row.dataset.equipId = String(e.id);
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "atrib-equip-checkbox";
      cb.dataset.equipId = String(e.id);
      const body = document.createElement("span");
      body.className = "atrib-equip-row-body";
      const nameEl = document.createElement("span");
      nameEl.className = "atrib-equip-row-name";
      nameEl.textContent = String(e.nome || "");
      const codeEl = document.createElement("span");
      codeEl.className = "atrib-equip-row-code";
      codeEl.textContent = String(e.codigo_barras || "");
      body.appendChild(nameEl);
      body.appendChild(codeEl);
      row.appendChild(cb);
      row.appendChild(body);
      atribEquipamentoList.appendChild(row);
    }
    syncAtribEquipamentoUI();
  }

  function initAtribEquipamentoPicker() {
    if (!atribEquipamentoList || atribEquipamentoList.dataset.bound === "1") return;
    atribEquipamentoList.dataset.bound = "1";
    atribEquipamentoList.addEventListener("change", (e) => {
      const cb = e.target.closest(".atrib-equip-checkbox");
      if (!cb || !atribEquipamento) return;
      const id = String(cb.dataset.equipId);
      const opt = Array.from(atribEquipamento.options).find((o) => String(o.value) === id);
      if (opt) opt.selected = cb.checked;
      atribEquipamento.dispatchEvent(new Event("change", { bubbles: true }));
      atribEquipamento.dataset.touched = "true";
      syncAtribEquipamentoUI();
      validateField(atribEquipamento);
    });
    if (atribEquipamentoTags) {
      atribEquipamentoTags.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-remove-equip]");
        if (!btn || !atribEquipamento) return;
        e.preventDefault();
        const id = String(btn.dataset.removeEquip);
        const opt = Array.from(atribEquipamento.options).find((o) => String(o.value) === id);
        if (opt) opt.selected = false;
        atribEquipamento.dispatchEvent(new Event("change", { bubbles: true }));
        atribEquipamento.dataset.touched = "true";
        syncAtribEquipamentoUI();
        validateField(atribEquipamento);
      });
    }
  }

  async function loadAtribuicoesPage() {
    showMsg("");
    renderLoadingRow(atribuicoesTbody, 4, "Carregando atribuições...");
    try {
      const [colaboradores, equipamentos, atribuicoes, atribuicoesAtivas] = await Promise.all([
        request("/colaboradores"),
        request("/equipamentos"),
        request(`/atribuicoes?${buildAtribuicoesQuery(atribuicoesCurrentPage)}`),
        request("/atribuicoes"),
      ]);

      const colRows = Array.isArray(colaboradores) ? colaboradores : colaboradores?.value || [];
      const eqRows = Array.isArray(equipamentos) ? equipamentos : equipamentos?.value || [];
      const atRows = Array.isArray(atribuicoes) ? atribuicoes : atribuicoes?.items || [];
      const ativasRows = Array.isArray(atribuicoesAtivas)
        ? atribuicoesAtivas
        : atribuicoesAtivas?.items || [];
      const pagination = atribuicoes?.pagination || {
        page: 1,
        totalPages: 1,
      };
      atribuicoesCache = atRows;

      atribColaborador.innerHTML = '<option value="">Selecione o colaborador</option>';
      for (const c of colRows) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.nome} (ID: ${c.id})`;
        atribColaborador.appendChild(opt);
      }

      renderAtribEquipamentoChecklist(eqRows);

      validateField(atribColaborador);
      validateField(atribEquipamento);
      updateAtribuicoesMetrics(ativasRows, eqRows);
      atribuicoesCurrentPage = Number(pagination.page || 1);
      atribuicoesTotalPages = Number(pagination.totalPages || 1);
      atribuicoesResultsTotal = Number(pagination.total || atRows.length || 0);
      applyAtribuicoesView();
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        atribuicoesTbody,
        4,
        "Não foi possível carregar",
        "As atribuições não puderam ser consultadas agora. Tente novamente em instantes."
      );
      updateAtribuicoesMetrics([], []);
      atribuicoesResultsTotal = 0;
      renderAtribEquipamentoChecklist([]);
      updateFilterSummary();
      updateServerPaginationState(
        1,
        1,
        atribuicoesPageInfo,
        atribuicoesPrevBtn,
        atribuicoesNextBtn
      );
      showMsg(err.message || "Falha ao carregar atribuições");
      throw err;
    }
  }

  async function loadEquipamentosListPage(page = 1, direction = null) {
    showMsg("");
    try {
      const response = await request(`/equipamentos?${buildEquipamentosQuery(page)}`);
      equipamentosCache = Array.isArray(response) ? response : response?.items || [];
      equipamentosCurrentPage = Number(response?.pagination?.page || page || 1);
      equipamentosTotalPages = Number(response?.pagination?.totalPages || 1);
      equipamentosResultsTotal = Number(response?.pagination?.total || equipamentosCache.length || 0);

      if (direction) {
        animateListTransition(equipamentosTableWrap, direction, () => applyEquipamentosView());
      } else {
        applyEquipamentosView();
      }
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        equipamentosTbody,
        7,
        "Não foi possível carregar",
        "Os equipamentos não puderam ser filtrados agora. Tente novamente em instantes."
      );
      equipamentosResultsTotal = 0;
      updateFilterSummary();
      updateServerPaginationState(1, 1, equipamentosPageInfo, equipamentosPrevBtn, equipamentosNextBtn);
      showMsg(err.message || "Falha ao carregar equipamentos");
    }
  }

  async function loadAtribuicoesListPage(page = 1, direction = null) {
    showMsg("");
    try {
      const response = await request(`/atribuicoes?${buildAtribuicoesQuery(page)}`);
      atribuicoesCache = Array.isArray(response) ? response : response?.items || [];
      atribuicoesCurrentPage = Number(response?.pagination?.page || page || 1);
      atribuicoesTotalPages = Number(response?.pagination?.totalPages || 1);
      atribuicoesResultsTotal = Number(response?.pagination?.total || atribuicoesCache.length || 0);

      if (direction) {
        animateListTransition(atribuicoesTableWrap, direction, () => applyAtribuicoesView());
      } else {
        applyAtribuicoesView();
      }
      updateFilterSummary();
      syncUrlState({ replace: true });
    } catch (err) {
      renderEmptyRow(
        atribuicoesTbody,
        5,
        "Não foi possível carregar",
        "As atribuições não puderam ser filtradas agora. Tente novamente em instantes."
      );
      atribuicoesResultsTotal = 0;
      updateFilterSummary();
      updateServerPaginationState(1, 1, atribuicoesPageInfo, atribuicoesPrevBtn, atribuicoesNextBtn);
      showMsg(err.message || "Falha ao carregar atribuições");
    }
  }

  async function refreshStatsAndActivities() {
    showMsg("");
    renderActivityState("Atualizando painel", "Buscando as movimentações mais recentes do sistema.", true);
    try {
      const colaboradores = await request("/colaboradores");
      const equipamentos = await request("/equipamentos");
      const atribuicoes = await request("/atribuicoes");

      const colRows = Array.isArray(colaboradores) ? colaboradores : colaboradores?.value || [];
      const eqRows = Array.isArray(equipamentos) ? equipamentos : equipamentos?.value || [];
      const atRows = Array.isArray(atribuicoes) ? atribuicoes : atribuicoes?.value || [];

      const totalCol = colRows.length;
      const totalEq = eqRows.length;
      const emUso = (eqRows || []).filter((e) => e.status === "em uso").length;
      const disponiveis = (eqRows || []).filter((e) => e.status === "disponivel").length;
      const aguardandoAtribuicao = disponiveis;

      if (statColaboradores) statColaboradores.textContent = String(totalCol);
      statEquipamentos.textContent = String(totalEq);
      if (statDisponiveis) statDisponiveis.textContent = String(disponiveis);
      statAtribuidos.textContent = String(emUso);
      if (statAguardando) statAguardando.textContent = String(aguardandoAtribuicao);

      activityList.innerHTML = "";
      const top = (atRows || []).slice(0, 4);
      if (!top.length) {
        renderActivityState(
          "Sem atividades recentes",
          "As próximas movimentações de equipamentos aparecerão aqui."
        );
        return;
      }

      for (const a of top) {
        const row = document.createElement("button");
        row.className = "saas-activity";
        row.type = "button";
        row.dataset.activityQuery = `${a.colaborador_nome} ${a.equipamento_nome}`.trim();
        row.setAttribute(
          "aria-label",
          `Ver atribuição de ${a.equipamento_nome} com ${a.colaborador_nome}`
        );
        row.innerHTML = `
          <span class="saas-dot is-assign" aria-hidden="true"></span>
          <div class="saas-activity-text">
            <div class="saas-activity-title">
              ${a.equipamento_nome} atribuído a <span>${a.colaborador_nome}</span>
            </div>
            <div class="saas-activity-time">${relativeTime(a.data_atribuicao)}</div>
          </div>
          <span class="saas-activity-chev" aria-hidden="true">›</span>
        `;
        activityList.appendChild(row);
      }
    } catch (err) {
      renderActivityState(
        "Não foi possível atualizar o painel",
        "Houve um problema ao buscar as informações mais recentes."
      );
      showMsg(err.message || "Falha ao atualizar o dashboard");
      throw err;
    }
  }

  function doLogout() {
    const token = localStorage.getItem(TOKEN_KEY);
    const finalizeLogout = () => {
      clearAuthData();
      window.appToast?.queuePendingToast?.({
        type: "info",
        title: "Sessão encerrada",
        message: "Logout realizado com sucesso.",
      });
      window.location.href = "/login.html";
    };

    if (!token) {
      finalizeLogout();
      return;
    }

    fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .catch(() => null)
      .finally(finalizeLogout);
  }

  // Events
  sidebarOpenBtn?.addEventListener("click", openSidebar);
  sidebarCloseBtn?.addEventListener("click", closeSidebar);
  backdrop?.addEventListener("click", closeSidebar);

  logoutBtn?.addEventListener("click", doLogout);
  topLogoutBtn?.addEventListener("click", doLogout);
  viewAllActivitiesBtn?.addEventListener("click", () => {
    showPage("atribuicoes");
    closeSidebar();
  });

  organizacaoNewDepartamentoBtn?.addEventListener("click", () => {
    void createDepartamentoFromOrganizacao();
  });
  unidadesNewBtn?.addEventListener("click", () => {
    void openUnidadeCreateModal();
  });

  unidadeCreateEstado?.addEventListener("change", () => {
    void onUnidadeCreateEstadoChange();
  });

  unidadeCreateForm?.addEventListener("submit", (e) => {
    void handleUnidadeCreateFormSubmit(e);
  });
  unidadeCreateBtnCancel?.addEventListener("click", () => closeUnidadeCreateModal());
  unidadeCreateModalClose?.addEventListener("click", () => closeUnidadeCreateModal());
  unidadeCreateModal?.addEventListener("mousedown", (e) => {
    if (e.target === unidadeCreateModal) closeUnidadeCreateModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !unidadeCreateModal || unidadeCreateModal.hidden) return;
    e.preventDefault();
    closeUnidadeCreateModal();
  });
  activityList?.addEventListener("click", (event) => {
    const trigger = event.target.closest(".saas-activity[data-activity-query]");
    if (!trigger) return;
    openAtribuicoesWithFilter(trigger.dataset.activityQuery);
  });
  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-filter-scope][data-filter-key]");
    if (!removeBtn) return;
    removeFilterChip(removeBtn.dataset.filterScope, removeBtn.dataset.filterKey);
  });

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (!page) return;
      showPage(page);
      closeSidebar();
    });
  });

  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.go;
      if (!page) return;
      showPage(page);
      closeSidebar();
    });
  });

  eqBusca?.addEventListener("input", () => {
    equipamentosCurrentPage = 1;
    updateFilterSummary();
    scheduleRefresh("equipamentos", () => loadEquipamentosListPage(1));
  });
  atribuicoesSearch?.addEventListener("input", () => {
    atribuicoesCurrentPage = 1;
    updateFilterSummary();
    scheduleRefresh("atribuicoes", () => loadAtribuicoesListPage(1));
  });
  equipamentosSituacaoFilter?.addEventListener("change", () => {
    equipamentosCurrentPage = 1;
    updateFilterSummary();
    loadEquipamentosListPage(1);
  });
  equipamentosDisponibilidadeFilter?.addEventListener("change", () => {
    equipamentosCurrentPage = 1;
    updateFilterSummary();
    loadEquipamentosListPage(1);
  });
  atribuicoesStatusFilter?.addEventListener("change", () => {
    atribuicoesCurrentPage = 1;
    updateFilterSummary();
    loadAtribuicoesListPage(1);
  });
  atribuicoesDataInicial?.addEventListener("change", () => {
    atribuicoesCurrentPage = 1;
    updateFilterSummary();
    loadAtribuicoesListPage(1);
  });
  atribuicoesDataFinal?.addEventListener("change", () => {
    atribuicoesCurrentPage = 1;
    updateFilterSummary();
    loadAtribuicoesListPage(1);
  });
  equipamentosClearFiltersBtn?.addEventListener("click", () => {
    resetEquipamentosFiltersState();
    updateFilterSummary();
    loadEquipamentosListPage(1);
    focusField(eqBusca);
  });
  atribuicoesClearFiltersBtn?.addEventListener("click", () => {
    resetAtribuicoesFiltersState();
    updateFilterSummary();
    loadAtribuicoesListPage(1);
    focusField(atribuicoesSearch);
  });
  colaboradoresSearch?.addEventListener("input", () => {
    colaboradoresCurrentPage = 1;
    updateFilterSummary();
    scheduleRefresh("colaboradores", () => loadColaboradoresListPage(1));
  });
  colaboradoresDepartamentoFilter?.addEventListener("change", () => {
    colaboradoresCurrentPage = 1;
    updateFilterSummary();
    loadColaboradoresListPage(1);
  });
  colaboradoresCargoFilter?.addEventListener("change", () => {
    colaboradoresCurrentPage = 1;
    updateFilterSummary();
    loadColaboradoresListPage(1);
  });
  colaboradoresClearFiltersBtn?.addEventListener("click", () => {
    resetColaboradoresFiltersState();
    updateFilterSummary();
    loadColaboradoresListPage(1);
    focusField(colaboradoresSearch);
  });
  colaboradoresPrevBtn?.addEventListener("click", async () => {
    if (colaboradoresCurrentPage <= 1) return;
    await loadColaboradoresListPage(Math.max(1, colaboradoresCurrentPage - 1), "prev");
  });
  colaboradoresNextBtn?.addEventListener("click", async () => {
    if (colaboradoresCurrentPage >= colaboradoresTotalPages) return;
    await loadColaboradoresListPage(colaboradoresCurrentPage + 1, "next");
  });
  equipamentosPrevBtn?.addEventListener("click", async () => {
    if (equipamentosCurrentPage <= 1) return;
    await loadEquipamentosListPage(Math.max(1, equipamentosCurrentPage - 1), "prev");
  });
  equipamentosNextBtn?.addEventListener("click", async () => {
    if (equipamentosCurrentPage >= equipamentosTotalPages) return;
    await loadEquipamentosListPage(equipamentosCurrentPage + 1, "next");
  });
  atribuicoesPrevBtn?.addEventListener("click", async () => {
    if (atribuicoesCurrentPage <= 1) return;
    await loadAtribuicoesListPage(Math.max(1, atribuicoesCurrentPage - 1), "prev");
  });
  atribuicoesNextBtn?.addEventListener("click", async () => {
    if (atribuicoesCurrentPage >= atribuicoesTotalPages) return;
    await loadAtribuicoesListPage(atribuicoesCurrentPage + 1, "next");
  });
  colaboradorNewBtn?.addEventListener("click", async () => {
    if (!canManageCriticalData()) {
      showMsg("Você não tem permissão para cadastrar colaboradores.", "warning");
      return;
    }
    const shouldOpen = colaboradorFormPanel?.hidden ?? true;
    if (shouldOpen) {
      colaboradorEditingId = null;
      const head = colaboradorFormPanel?.querySelector(".saas-drawer-head strong");
      const sub = colaboradorFormPanel?.querySelector(".saas-drawer-head span");
      if (head) head.textContent = "Novo colaborador";
      if (sub) sub.textContent = "Cadastre rapidamente um novo membro da equipe com os dados principais.";
      const submitLabel = colaboradorForm?.querySelector("button[type='submit']");
      if (submitLabel) submitLabel.textContent = "Cadastrar colaborador";
      resetForm(colaboradorForm);
      await loadUnidades({ preserveSelection: false });
      void loadCargosForDepartamento(null);
    }
    setColaboradorFormOpen(shouldOpen);
    if (shouldOpen) focusFirstField(colaboradorForm);
  });
  equipamentoNewBtn?.addEventListener("click", () => {
    if (!canManageCriticalData()) {
      showMsg("Você não tem permissão para cadastrar equipamentos.", "warning");
      return;
    }
    const shouldOpen = equipamentoFormPanel?.hidden ?? true;
    if (shouldOpen) {
      startEquipamentoCreate();
      return;
    }
    resetEquipamentoForm();
    setEquipamentoFormOpen(false);
  });
  atribuicaoNewBtn?.addEventListener("click", () => {
    const shouldOpen = atribuicaoFormPanel?.hidden ?? true;
    resetForm(atribuirForm);
    setAtribuicaoFormOpen(shouldOpen);
    if (shouldOpen) focusFirstField(atribuirForm);
  });

  departamentoSelect?.addEventListener("change", () => {
    const raw = String(departamentoSelect.value || "");
    if (raw === "__create_departamento__") {
      void (async () => {
        const nome = await showPromptModal({
          title: "Novo departamento",
          message: "Informe o nome do departamento.",
          initialValue: "",
          placeholder: "Ex: TI",
          confirmText: "Criar",
          cancelText: "Cancelar",
        });
        if (nome == null) {
          await loadDepartamentos({ preserveSelection: false });
          return;
        }
        const trimmed = String(nome || "").trim();
        if (!trimmed) {
          await showAlertModal({ title: "Nome inválido", message: "O nome do departamento não pode ser vazio." });
          await loadDepartamentos({ preserveSelection: false });
          return;
        }
        try {
          const created = await request("/departamentos", {
            method: "POST",
            body: { nome: normalizeTextCase(trimmed) },
          });
          await loadDepartamentos({ preserveSelection: false, selectId: created?.id ?? null });
          const depId = created?.id ? Number(created.id) : null;
          await loadCargosForDepartamento(depId, { preserveSelection: false });
        } catch (err) {
          await showAlertModal({ title: "Não foi possível criar", message: err.message || "Falha ao criar departamento" });
          await loadDepartamentos({ preserveSelection: false });
          await loadCargosForDepartamento(null);
        }
      })();
      return;
    }

    const depId = raw ? Number(raw) : null;
    void loadCargosForDepartamento(depId, { preserveSelection: false });
  });

  cargoSelect?.addEventListener("change", () => {
    const raw = String(cargoSelect.value || "");
    if (raw !== "__create_cargo__") return;
    const depId = Number(departamentoSelect?.value);
    if (!Number.isInteger(depId) || depId <= 0) return;
    void (async () => {
      const nome = await showPromptModal({
        title: "Novo cargo",
        message: "Informe o nome do cargo.",
        initialValue: "",
        placeholder: "Ex: Desenvolvedor",
        confirmText: "Criar",
        cancelText: "Cancelar",
      });
      if (nome == null) {
        await loadCargosForDepartamento(depId, { preserveSelection: false });
        return;
      }
      const trimmed = String(nome || "").trim();
      if (!trimmed) {
        await showAlertModal({ title: "Nome inválido", message: "O nome do cargo não pode ser vazio." });
        await loadCargosForDepartamento(depId, { preserveSelection: false });
        return;
      }
      try {
        const created = await request("/cargos", {
          method: "POST",
          body: { nome: normalizeTextCase(trimmed), departamento_id: depId },
        });
        await loadCargosForDepartamento(depId, { preserveSelection: false, selectId: created?.id ?? null });
        validateField(cargoSelect, { forceTouch: true });
        showMsg("Cargo criado com sucesso.", "success");
      } catch (err) {
        await showAlertModal({ title: "Não foi possível criar", message: err.message || "Falha ao criar cargo" });
        await loadCargosForDepartamento(depId, { preserveSelection: false });
      }
    })();
  });

  colaboradorForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMsg("");
    if (!canManageCriticalData()) {
      showMsg("Você não tem permissão para cadastrar colaboradores.", "warning");
      return;
    }
    const depEl = document.getElementById("departamento");
    const cargoEl = document.getElementById("cargo");
    const depNum = Number(depEl?.value);
    const cargoNum = Number(cargoEl?.value);
    if (!depEl || !Number.isInteger(depNum) || depNum <= 0) {
      showMsg("Selecione um departamento", "warning");
      validateField(depEl, { forceTouch: true });
      return;
    }
    if (!cargoEl || cargoEl.disabled || !Number.isInteger(cargoNum) || cargoNum <= 0) {
      showMsg("Selecione um cargo", "warning");
      validateField(cargoEl, { forceTouch: true });
      return;
    }
    if (!validateForm(colaboradorForm)) {
      showMsg("Revise os campos destacados antes de continuar.", "warning");
      return;
    }
    const submitBtn = e.submitter || colaboradorForm.querySelector("button[type='submit']");
    const payload = {
      nome: normalizeTextCase(document.getElementById("nome").value.trim()),
      documento: digitsOnly(document.getElementById("documento")?.value),
      cargo_id: cargoNum,
      departamento_id: depNum,
      unidade_id: Number(unidadeSelect?.value || ""),
      unidade: String(unidadeSelect?.selectedOptions?.[0]?.textContent || "").trim(),
    };
    try {
      setButtonLoading(submitBtn, true, "Salvando...");
      const isEditing = Number.isInteger(Number(colaboradorEditingId)) && Number(colaboradorEditingId) > 0;
      const created = isEditing
        ? await request(`/colaboradores/${encodeURIComponent(colaboradorEditingId)}`, { method: "PATCH", body: payload })
        : await request("/colaboradores", { method: "POST", body: payload });
      pendingRowHighlight.colaboradores = isEditing ? colaboradorEditingId : created?.id ?? null;
      showMsg(isEditing ? "Colaborador atualizado com sucesso." : "Colaborador cadastrado com sucesso.", "success");
      colaboradorEditingId = null;
      setColaboradorFormOpen(false);
      resetColaboradoresFiltersState();
      await loadColaboradores();
      await refreshStatsAndActivities();
      focusField(colaboradoresSearch);
    } catch (err) {
      showMsg(err.message || (colaboradorEditingId ? "Falha ao atualizar colaborador" : "Falha ao cadastrar colaborador"));
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  // Criação de departamentos/cargos agora é feita via opção "+ Criar..." nos selects,
  // ou pela aba "Departamentos & Cargos" (Organização).

  equipamentoForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMsg("");
    if (!canManageCriticalData()) {
      showMsg("Você não tem permissão para cadastrar/editar equipamentos.", "warning");
      return;
    }
    if (!validateForm(equipamentoForm)) {
      showMsg("Revise os campos destacados antes de continuar.", "warning");
      return;
    }
    const submitBtn = e.submitter || equipamentoForm.querySelector("button[type='submit']");
    const equipamentoId = Number(equipamentoIdInput?.value || 0);
    const isEditing = Number.isInteger(equipamentoId) && equipamentoId > 0;
    const valorEl = document.getElementById("eq_valor");
    const payload = {
      nome: normalizeTextCase(document.getElementById("eq_nome").value.trim()),
      serial: String(document.getElementById("eq_serial").value || "").trim(),
      modelo: normalizeTextCase(document.getElementById("eq_modelo").value.trim()),
      marca: normalizeTextCase(document.getElementById("eq_marca").value.trim()),
      observacoes: String(document.getElementById("eq_observacoes").value || "").trim(),
      valor: moedaParaNumero(valorEl?.value),
      status: document.getElementById("eq_status").value,
    };
    try {
      setButtonLoading(submitBtn, true, "Salvando...");
      const response = isEditing
        ? await request(`/equipamentos/${equipamentoId}`, { method: "PATCH", body: payload })
        : await request("/equipamentos", { method: "POST", body: payload });
      pendingRowHighlight.equipamentos = response?.id ?? equipamentoId ?? null;
      showMsg(
        isEditing
          ? "Equipamento atualizado com sucesso."
          : "Equipamento cadastrado com sucesso.",
        "success"
      );
      resetEquipamentoForm();
      setEquipamentoFormOpen(false);
      await loadEquipamentos();
      await refreshStatsAndActivities();
      focusField(eqBusca);
    } catch (err) {
      showMsg(
        err.message || (isEditing ? "Falha ao atualizar equipamento" : "Falha ao cadastrar equipamento")
      );
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  atribuirForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMsg("");
    if (!validateForm(atribuirForm)) {
      showMsg("Revise os campos destacados antes de continuar.", "warning");
      return;
    }
    const submitBtn = e.submitter || atribuirForm.querySelector("button[type='submit']");
    const equipamentoIds = Array.from(atribEquipamento.selectedOptions || [])
      .map((opt) => Number(opt.value))
      .filter((id) => Number.isInteger(id) && id > 0);
    const payload = {
      colaborador_id: Number(atribColaborador.value),
      equipamento_ids: equipamentoIds,
    };
    try {
      setButtonLoading(submitBtn, true, "Atribuindo...");
      const created = await request("/atribuir", { method: "POST", body: payload });
      pendingRowHighlight.atribuicoes = created?.id ?? created?.items?.[0]?.id ?? null;
      const count = Array.isArray(created?.items) ? created.items.length : 1;
      showMsg(
        count > 1 ? `Atribuição realizada com sucesso para ${count} equipamentos.` : "Atribuição realizada com sucesso.",
        "success"
      );
      resetForm(atribuirForm);
      setAtribuicaoFormOpen(false);
      if (atribuicoesSearch) atribuicoesSearch.value = "";
      if (atribuicoesStatusFilter) atribuicoesStatusFilter.value = "ativo";
      if (atribuicoesDataInicial) atribuicoesDataInicial.value = "";
      if (atribuicoesDataFinal) atribuicoesDataFinal.value = "";
      await loadAtribuicoesPage();
      await refreshStatsAndActivities();
      focusField(atribuicoesSearch);
    } catch (err) {
      showMsg(err.message || "Falha ao atribuir equipamento");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  equipamentosTbody?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-action='editar-equipamento']");
    if (editBtn) {
      if (!canManageCriticalData()) {
        showMsg("Você não tem permissão para editar equipamentos.", "warning");
        return;
      }
      const equipamentoId = Number(editBtn.dataset.equipamentoId);
      const equipamento = (equipamentosCache || []).find(
        (item) => Number(item.id) === equipamentoId
      );

      if (!equipamento) {
        showMsg("Não foi possível localizar o equipamento selecionado.", "warning");
        return;
      }

      showMsg("");
      startEquipamentoEdit(equipamento);
      return;
    }

    const inativarBtn = e.target.closest("[data-action='inativar-equipamento']");
    if (!inativarBtn || inativarBtn.disabled) return;
    if (!canManageCriticalData()) {
      showMsg("Você não tem permissão para inativar equipamentos.", "warning");
      return;
    }

    const equipamentoId = Number(inativarBtn.dataset.equipamentoId);
    if (!equipamentoId) return;

    const equipamentoNome = String(inativarBtn.dataset.equipamentoNome || "este equipamento");
    const confirmed = await showConfirmModal({
      title: "Inativar equipamento",
      message: `Confirmar inativação de "${equipamentoNome}"? O item será removido da lista principal, sem perder o histórico.`,
      confirmText: "Inativar",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    showMsg("");
    try {
      setButtonLoading(inativarBtn, true, "Inativando...");
      await request(`/equipamentos/${equipamentoId}/inativar`, { method: "POST" });

      if (String(equipamentoIdInput?.value || "") === String(equipamentoId)) {
        resetEquipamentoForm();
        setEquipamentoFormOpen(false);
      }

      showMsg("Equipamento inativado com sucesso.", "success");
      await loadEquipamentos();
      await refreshStatsAndActivities();
      focusField(eqBusca);
    } catch (err) {
      showMsg(err.message || "Falha ao inativar equipamento");
      setButtonLoading(inativarBtn, false);
    }
  });

  atribuicoesTbody?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action='devolver']");
    if (!btn) return;
    const equipamentoId = Number(btn.dataset.equipamentoId);
    if (!equipamentoId) return;
    const colaboradorNome = String(btn.dataset.colaboradorNome || "este colaborador");
    const equipamentoNome = String(btn.dataset.equipamentoNome || "este equipamento");

    const confirmed = await showConfirmModal({
      title: "Devolver equipamento",
      message: `Confirmar devolução de "${equipamentoNome}" vinculado a ${colaboradorNome}?`,
      confirmText: "Devolver",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    showMsg("");
    try {
      setButtonLoading(btn, true, "Devolvendo...");
      await request("/liberar", { method: "POST", body: { equipamento_id: equipamentoId } });
      showMsg("Equipamento devolvido com sucesso.", "success");
      await loadAtribuicoesPage();
      await refreshStatsAndActivities();
    } catch (err) {
      showMsg(err.message || "Falha ao devolver equipamento");
      setButtonLoading(btn, false);
    }
  });

  atribuicoesTbody?.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("[data-action='toggle-atribuicoes']");
    if (!toggleBtn) return;
    const key = String(toggleBtn.dataset.colaboradorKey || "").trim();
    if (!key) return;
    const detailsRow = atribuicoesTbody.querySelector(
      `.atribuicoes-details-row[data-colaborador-key="${CSS.escape(key)}"]`
    );
    if (!detailsRow) return;
    detailsRow.hidden = !detailsRow.hidden;
    toggleBtn.textContent = detailsRow.hidden ? "Ver atribuições" : "Ocultar atribuições";
  });

  usuariosTbody?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action='toggle-user-perfil']");
    if (!btn || btn.disabled) return;
    if (!canManageUsers()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    const userId = Number(btn.dataset.userId);
    const nextPerfil = String(btn.dataset.nextPerfil || "").trim();
    const userNome = String(btn.dataset.userNome || "este usuário");
    if (!userId || !nextPerfil) return;

    const confirmed = await showConfirmModal({
      title: "Alterar perfil",
      message: `Tem certeza que deseja alterar o perfil de "${userNome}" para ${
        nextPerfil === "admin" ? "Administrador" : "Operador"
      }?`,
      confirmText: "Alterar",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    showMsg("");
    try {
      setButtonLoading(btn, true, "Atualizando...");
      await request(`/usuarios/${userId}/perfil`, { method: "PATCH", body: { perfil: nextPerfil } });
      showMsg("Perfil atualizado com sucesso.", "success");
      await loadUsuarios();
    } catch (err) {
      showMsg(err.message || "Falha ao atualizar perfil");
      setButtonLoading(btn, false);
    }
  });

  function closeGlobalDropdown() {
    if (!globalDropdown) return;
    globalDropdown.hidden = true;
    globalDropdown.innerHTML = "";
    globalDropdown.style.left = "-9999px";
    globalDropdown.style.top = "-9999px";
    globalDropdownAnchor = null;
    globalDropdownContext = null;
  }

  function positionGlobalDropdown() {
    if (!globalDropdown || globalDropdown.hidden || !globalDropdownAnchor) return;
    const rect = globalDropdownAnchor.getBoundingClientRect();
    const margin = 8;
    const maxW = Math.min(320, window.innerWidth - margin * 2);
    globalDropdown.style.minWidth = "220px";
    globalDropdown.style.maxWidth = `${maxW}px`;

    const ddRect = globalDropdown.getBoundingClientRect();
    let left = rect.right - ddRect.width;
    let top = rect.bottom + 8;

    left = Math.max(margin, Math.min(left, window.innerWidth - ddRect.width - margin));
    if (top + ddRect.height > window.innerHeight - margin) {
      top = rect.top - ddRect.height - 8;
    }
    top = Math.max(margin, Math.min(top, window.innerHeight - ddRect.height - margin));

    globalDropdown.style.left = `${Math.round(left)}px`;
    globalDropdown.style.top = `${Math.round(top)}px`;
  }

  function openGlobalDropdown({ anchorEl, items, context }) {
    if (!globalDropdown || !anchorEl) return;
    globalDropdownAnchor = anchorEl;
    globalDropdownContext = context || null;

    globalDropdown.innerHTML = items
      .map(
        (it) => `
          <button
            type="button"
            class="saas-dropdown-item ${it.danger ? "is-danger" : ""}"
            data-dd-action="${escapeHtml(it.action)}"
          >${escapeHtml(it.label)}</button>
        `
      )
      .join("");

    globalDropdown.hidden = false;
    positionGlobalDropdown();
  }

  async function handleGlobalDropdownAction(action, ctx) {
    if (!ctx || !ctx.type) return;

    if (ctx.type === "colaborador") {
      const colaboradorId = Number(ctx.id);
      const colaborador = (colaboradoresCache || []).find((c) => Number(c.id) === colaboradorId);
      if (!colaborador) return;

      if (action === "edit") {
      colaboradorEditingId = colaboradorId;
      const head = colaboradorFormPanel?.querySelector(".saas-drawer-head strong");
      const sub = colaboradorFormPanel?.querySelector(".saas-drawer-head span");
      if (head) head.textContent = "Editar colaborador";
      if (sub) sub.textContent = "Atualize os dados do colaborador e salve as alterações.";
      const submitLabel = colaboradorForm?.querySelector("button[type='submit']");
      if (submitLabel) submitLabel.textContent = "Salvar alterações";

      const nomeEl = document.getElementById("nome");
      const documentoEl = document.getElementById("documento");
      if (nomeEl) nomeEl.value = String(colaborador.nome || "");
      if (documentoEl) {
        documentoEl.value = formatDocumentoMask(colaborador.documento || colaborador.cpf || "");
        updateDocumentoHintUi();
      }
      await loadUnidades({ preserveSelection: false, selectId: colaborador.unidade_id || null });
      if (unidadeSelect) {
        if (colaborador.unidade_id != null) {
          unidadeSelect.value = String(colaborador.unidade_id || "");
        } else if (colaborador.unidade) {
          const targetNome = String(colaborador.unidade || "").trim();
          const opt = Array.from(unidadeSelect.options).find((o) => {
            const id = Number(o.value);
            if (!Number.isInteger(id) || id <= 0) return false;
            const u = unidadesCache.find((x) => Number(x.id) === id);
            if (!u) return false;
            const label = formatUnidadeDisplayLabel(u);
            return (
              String(o.textContent || "").trim() === targetNome ||
              String(u.nome || "").trim() === targetNome ||
              label === targetNome
            );
          });
          if (opt) unidadeSelect.value = String(opt.value || "");
        }
      }

      if (colaborador.departamento_id) {
        await loadDepartamentos({ preserveSelection: false, selectId: colaborador.departamento_id });
        await loadCargosForDepartamento(Number(colaborador.departamento_id), {
          preserveSelection: false,
          selectId: colaborador.cargo_id || null,
        });
      } else {
        await loadDepartamentos({ preserveSelection: true });
        await loadCargosForDepartamento(null);
      }

      setColaboradorFormOpen(true);
      focusFirstField(colaboradorForm);
      return;
      }

      if (action === "delete") {
      const confirmedDelete = await showConfirmModal({
        title: "Excluir colaborador",
        message:
          "Tem certeza que deseja excluir este colaborador?\n\nEssa ação não pode ser desfeita.",
        confirmText: "Excluir",
        cancelText: "Cancelar",
      });
      if (!confirmedDelete) return;

      showMsg("");
      const anchor = document.querySelector(
        `[data-action='open-colaborador-menu'][data-colaborador-id='${CSS.escape(String(colaboradorId))}']`
      );
      try {
        setButtonLoading(anchor, true, "Excluindo...");
        await request(`/colaboradores/${encodeURIComponent(colaboradorId)}`, { method: "DELETE" });
        showMsg("Colaborador excluído com sucesso.", "success");
        await loadColaboradores();
        await refreshStatsAndActivities();
      } catch (err) {
        await showAlertModal({
          title: "Não foi possível excluir",
          message: err.message || "Falha ao excluir colaborador",
        });
      } finally {
        setButtonLoading(anchor, false);
      }
      }
      return;
    }

    if (ctx.type === "departamento") {
      const depId = Number(ctx.id);
      const dep = (departamentosCache || []).find((d) => Number(d.id) === depId);
      if (!dep) return;

      if (action === "edit") {
        const nextName = await showPromptModal({
          title: "Editar departamento",
          message: "Atualize o nome do departamento.",
          initialValue: String(dep.nome || "").trim(),
          placeholder: "Nome do departamento",
          confirmText: "Salvar",
          cancelText: "Cancelar",
        });
        if (nextName == null) return;
        showMsg("");
        try {
          await request(`/departamentos/${encodeURIComponent(depId)}`, {
            method: "PATCH",
            body: { nome: nextName },
          });
          showMsg("Departamento atualizado com sucesso.", "success");
          await loadOrganizacaoPage();
          await loadDepartamentos({ preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível atualizar",
            message: err.message || "Falha ao atualizar departamento",
          });
        }
        return;
      }

      if (action === "delete") {
        const confirmed = await showConfirmModal({
          title: "Excluir departamento",
          message: `Tem certeza que deseja excluir "${String(dep.nome || "").trim()}"?\nEssa ação só é permitida se não houver cargos/colaboradores vinculados.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
        });
        if (!confirmed) return;
        showMsg("");
        try {
          await request(`/departamentos/${encodeURIComponent(depId)}`, { method: "DELETE" });
          showMsg("Departamento excluído com sucesso.", "success");
          await loadOrganizacaoPage();
          await loadDepartamentos({ preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível excluir",
            message: err.message || "Falha ao excluir departamento",
          });
        }
      }
      return;
    }

    if (ctx.type === "cargo") {
      const cargoId = Number(ctx.id);
      const cargo = (cargosCache || []).find((c) => Number(c.id) === cargoId);
      if (!cargo) return;

      if (action === "edit") {
        const nextName = await showPromptModal({
          title: "Editar cargo",
          message: "Atualize o nome do cargo.",
          initialValue: String(cargo.nome || "").trim(),
          placeholder: "Nome do cargo",
          confirmText: "Salvar",
          cancelText: "Cancelar",
        });
        if (nextName == null) return;
        showMsg("");
        try {
          await request(`/cargos/${encodeURIComponent(cargoId)}`, {
            method: "PATCH",
            body: { nome: nextName },
          });
          showMsg("Cargo atualizado com sucesso.", "success");
          await loadOrganizacaoPage();
          const depVal = departamentoSelect?.value ? Number(departamentoSelect.value) : null;
          await loadCargosForDepartamento(depVal, { preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível atualizar",
            message: err.message || "Falha ao atualizar cargo",
          });
        }
        return;
      }

      if (action === "delete") {
        const confirmed = await showConfirmModal({
          title: "Excluir cargo",
          message: `Tem certeza que deseja excluir "${String(cargo.nome || "").trim()}"?\nEssa ação só é permitida se não houver colaboradores vinculados.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
        });
        if (!confirmed) return;
        showMsg("");
        try {
          await request(`/cargos/${encodeURIComponent(cargoId)}`, { method: "DELETE" });
          showMsg("Cargo excluído com sucesso.", "success");
          await loadOrganizacaoPage();
          const depVal = departamentoSelect?.value ? Number(departamentoSelect.value) : null;
          await loadCargosForDepartamento(depVal, { preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível excluir",
            message: err.message || "Falha ao excluir cargo",
          });
        }
      }
    }

    if (ctx.type === "unidade") {
      const unidadeId = Number(ctx.id);
      const unidade = (unidadesCache || []).find((u) => Number(u.id) === unidadeId);
      if (!unidade) return;

      const parseTipo = (v) => {
        const x = String(v || "").trim().toLowerCase();
        return x === "filial" ? "filial" : "matriz";
      };
      const parseAtivo = (v) => {
        const x = String(v || "").trim().toLowerCase();
        return ["0", "false", "não", "nao", "inativo", "inativa"].includes(x) ? 0 : 1;
      };

      if (action === "edit") {
        const nextNome = await showPromptModal({
          title: "Editar unidade",
          message: "Atualize o nome da unidade.",
          initialValue: String(unidade.nome || "").trim(),
          placeholder: "Nome da unidade",
          confirmText: "Salvar",
          cancelText: "Cancelar",
        });
        if (nextNome == null) return;

        const nextTipo = await showPromptModal({
          title: "Tipo da unidade",
          message: "Digite 'matriz' ou 'filial'.",
          initialValue: String(unidade.tipo || "matriz").trim(),
          placeholder: "matriz ou filial",
          confirmText: "Continuar",
          cancelText: "Cancelar",
        });
        if (nextTipo == null) return;

        const nextCidade = await showPromptModal({
          title: "Cidade",
          message: "Atualize a cidade (ou use '—').",
          initialValue: String(unidade.cidade || "").trim() || "—",
          placeholder: "Ex: Bebedouro",
          confirmText: "Continuar",
          cancelText: "Cancelar",
        });
        if (nextCidade == null) return;

        const nextEstado = await showPromptModal({
          title: "Estado",
          message: "Atualize o estado (ou use '—').",
          initialValue: String(unidade.estado || "").trim() || "—",
          placeholder: "Ex: SP",
          confirmText: "Salvar",
          cancelText: "Cancelar",
        });
        if (nextEstado == null) return;

        const nextAtivo = await showPromptModal({
          title: "Ativo?",
          message: "Digite 'sim' para ativa ou 'não' para inativa.",
          initialValue: Number(unidade.ativo) === 0 ? "não" : "sim",
          placeholder: "sim ou não",
          confirmText: "Salvar",
          cancelText: "Cancelar",
        });
        if (nextAtivo == null) return;

        showMsg("");
        try {
          await request(`/unidades/${encodeURIComponent(unidadeId)}`, {
            method: "PATCH",
            body: {
              nome: nextNome,
              tipo: parseTipo(nextTipo),
              cidade: nextCidade,
              estado: nextEstado,
              ativo: parseAtivo(nextAtivo),
            },
          });
          showMsg("Unidade atualizada com sucesso.", "success");
          await loadUnidadesPage();
          await loadUnidades({ preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível atualizar",
            message: err.message || "Falha ao atualizar unidade",
          });
        }
        return;
      }

      if (action === "delete") {
        const confirmed = await showConfirmModal({
          title: "Excluir unidade",
          message: `Tem certeza que deseja excluir "${formatUnidadeDisplayLabel(unidade)}"?\nEssa ação será bloqueada se houver colaboradores vinculados.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
        });
        if (!confirmed) return;

        showMsg("");
        try {
          await request(`/unidades/${encodeURIComponent(unidadeId)}`, { method: "DELETE" });
          showMsg("Unidade excluída com sucesso.", "success");
          await loadUnidadesPage();
          await loadUnidades({ preserveSelection: true });
        } catch (err) {
          await showAlertModal({
            title: "Não foi possível excluir",
            message: err.message || "Falha ao excluir unidade",
          });
        }
      }
    }
  }

  globalDropdown?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-dd-action]");
    if (!btn) return;
    e.preventDefault();
    const action = String(btn.dataset.ddAction || "");
    const ctx = globalDropdownContext;
    closeGlobalDropdown();
    void handleGlobalDropdownAction(action, ctx);
  });

  document.addEventListener("click", (e) => {
    if (!globalDropdown || globalDropdown.hidden) return;
    const insideDropdown = e.target.closest("#globalDropdown");
    const insideAnchor =
      globalDropdownAnchor &&
      e.target.closest(
        "[data-action='open-colaborador-menu'], [data-action='dep-actions'], [data-action='cargo-actions'], [data-action='unidade-actions']"
      );
    if (!insideDropdown && !insideAnchor) closeGlobalDropdown();
  });

  window.addEventListener("scroll", () => positionGlobalDropdown(), true);
  window.addEventListener("resize", () => positionGlobalDropdown());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && globalDropdown && !globalDropdown.hidden) {
      e.preventDefault();
      closeGlobalDropdown();
    }
  });

  colaboradoresTbody?.addEventListener("click", async (e) => {
    const openBtn = e.target.closest("[data-action='open-colaborador-menu']");
    if (openBtn) {
      if (!canManageCriticalData()) {
        showMsg("Você não tem permissão para gerenciar colaboradores.", "warning");
        return;
      }
      const colaboradorId = Number(openBtn.dataset.colaboradorId);
      if (!Number.isInteger(colaboradorId) || colaboradorId <= 0) return;
      if (globalDropdown && !globalDropdown.hidden && globalDropdownAnchor === openBtn) {
        closeGlobalDropdown();
        return;
      }
      openGlobalDropdown({
        anchorEl: openBtn,
        context: { type: "colaborador", id: colaboradorId },
        items: [
          { action: "edit", label: "Editar colaborador" },
          { action: "delete", label: "Excluir colaborador", danger: true },
        ],
      });
      return;
    }
  });

  organizacaoTbody?.addEventListener("click", async (e) => {
    const createCargoBtn = e.target.closest("[data-action='create-cargo']");
    if (createCargoBtn) {
      if (!canManageCriticalData()) {
        showMsg("Acesso restrito a administradores.", "warning");
        return;
      }
      const depId = Number(createCargoBtn.dataset.depId);
      if (!Number.isInteger(depId) || depId <= 0) return;
      const dep = (departamentosCache || []).find((d) => Number(d.id) === depId);
      const depName = String(dep?.nome || "").trim() || "este departamento";

      const nome = await showPromptModal({
        title: "Novo cargo",
        message: `Informe o nome do cargo para ${depName}.`,
        initialValue: "",
        placeholder: "Ex: Desenvolvedor",
        confirmText: "Criar",
        cancelText: "Cancelar",
      });
      if (nome == null) return;
      const trimmed = String(nome || "").trim();
      if (!trimmed) {
        await showAlertModal({ title: "Nome inválido", message: "O nome do cargo não pode ser vazio." });
        return;
      }

      showMsg("");
      try {
        setButtonLoading(createCargoBtn, true, "Criando...");
        const created = await request("/cargos", {
          method: "POST",
          body: { nome: normalizeTextCase(trimmed), departamento_id: depId },
        });
        pendingCargoHighlightId = created?.id ?? null;
        showMsg("Cargo criado com sucesso.", "success");
        await loadOrganizacaoPage();

        // reabrir a lista do departamento após recarregar
        const detailsRow = organizacaoTbody.querySelector(
          `.atribuicoes-details-row[data-dep-id="${CSS.escape(String(depId))}"]`
        );
        if (detailsRow) detailsRow.hidden = false;
      } catch (err) {
        await showAlertModal({
          title: "Não foi possível criar",
          message: err.message || "Falha ao criar cargo",
        });
      } finally {
        setButtonLoading(createCargoBtn, false);
      }
      return;
    }

    const toggleBtn = e.target.closest("[data-action='toggle-dep-cargos']");
    if (toggleBtn) {
      const depId = String(toggleBtn.dataset.depId || "").trim();
      if (!depId) return;
      const detailsRow = organizacaoTbody.querySelector(
        `.atribuicoes-details-row[data-dep-id="${CSS.escape(depId)}"]`
      );
      if (!detailsRow) return;
      detailsRow.hidden = !detailsRow.hidden;
      toggleBtn.textContent = detailsRow.hidden ? "Ver cargos" : "Ocultar cargos";
      return;
    }

    const depActions = e.target.closest("[data-action='dep-actions']");
    if (depActions) {
      if (!canManageCriticalData()) {
        showMsg("Acesso restrito a administradores.", "warning");
        return;
      }
      const depId = Number(depActions.dataset.depId);
      if (!Number.isInteger(depId) || depId <= 0) return;
      if (globalDropdown && !globalDropdown.hidden && globalDropdownAnchor === depActions) {
        closeGlobalDropdown();
        return;
      }
      openGlobalDropdown({
        anchorEl: depActions,
        context: { type: "departamento", id: depId },
        items: [
          { action: "edit", label: "Editar" },
          { action: "delete", label: "Excluir", danger: true },
        ],
      });
      return;
    }

    const cargoActions = e.target.closest("[data-action='cargo-actions']");
    if (cargoActions) {
      if (!canManageCriticalData()) {
        showMsg("Acesso restrito a administradores.", "warning");
        return;
      }
      const cargoId = Number(cargoActions.dataset.cargoId);
      if (!Number.isInteger(cargoId) || cargoId <= 0) return;
      if (globalDropdown && !globalDropdown.hidden && globalDropdownAnchor === cargoActions) {
        closeGlobalDropdown();
        return;
      }
      openGlobalDropdown({
        anchorEl: cargoActions,
        context: { type: "cargo", id: cargoId },
        items: [
          { action: "edit", label: "Editar" },
          { action: "delete", label: "Excluir", danger: true },
        ],
      });
    }
  });

  unidadesTbody?.addEventListener("click", (e) => {
    const unidadeActions = e.target.closest("[data-action='unidade-actions']");
    if (!unidadeActions) return;
    if (!canManageCriticalData()) {
      showMsg("Acesso restrito a administradores.", "warning");
      return;
    }
    const unidadeId = Number(unidadeActions.dataset.unidadeId);
    if (!Number.isInteger(unidadeId) || unidadeId <= 0) return;

    if (globalDropdown && !globalDropdown.hidden && globalDropdownAnchor === unidadeActions) {
      closeGlobalDropdown();
      return;
    }

    openGlobalDropdown({
      anchorEl: unidadeActions,
      context: { type: "unidade", id: unidadeId },
      items: [
        { action: "edit", label: "Editar" },
        { action: "delete", label: "Excluir", danger: true },
      ],
    });
  });

  window.addEventListener("popstate", () => {
    const state = hydrateStateFromUrl();
    if (state.view === currentPage) {
      refreshPageData(state.view);
      return;
    }
    showPage(state.view, { syncUrl: false });
  });

  // Init
  document.addEventListener("DOMContentLoaded", async () => {
    const token = getTokenOrRedirect();
    if (!token) return;
    window.appToast?.consumePendingToast?.();
    loadUserInfo();
    setupFormValidation();
    initAtribEquipamentoPicker();
    formatDatePill();
    await loadDepartamentos({ preserveSelection: false });
    const initDep = departamentoSelect?.value
      ? Number(departamentoSelect.value)
      : null;
    await loadCargosForDepartamento(initDep, { preserveSelection: false });
    applyAdminVisibility();
    setupRelatoriosThemeObserver();
    const state = hydrateStateFromUrl();
    showPage(state.view, { syncUrl: false, replaceHistory: true });
  });
})();


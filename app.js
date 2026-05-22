/* ==========================================================================
   AutoBudge - Sistema de Orçamentos Premium
   Core Application Logic (app.js)
   ========================================================================== */

// 1. DADOS DE DEMONSTRAÇÃO (MOCK) CASO LOCALSTORAGE ESTEJA VAZIO
const mockCompany = {
    name: "Brilho Real Estética Automotiva",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 98765-4321",
    email: "contato@brilhoreal.com.br",
    address: "Av. das Nações Unidas, 1420 - Pinheiros, São Paulo - SP",
    logo: "" // Vazio de início
};

const mockSettings = {
    retentionDays: 180, // 6 meses
    defaultPayment: "Pix (com 5% de desconto), Cartão de Crédito em até 6x sem juros, ou Dinheiro.",
    defaultDelivery: "2 a 3 dias úteis após a aprovação e entrega do veículo.",
    defaultWarranty: "12 meses para Vitrificação, 3 meses para Higienização e Polimento Técnico.",
    defaultNotice: "Este orçamento tem validade de 15 dias a partir da data de emissão. Sujeito a alteração caso haja mudança no estado do veículo."
};

const mockClients = [
    {
        id: "c-1",
        name: "Carlos Eduardo Santos",
        phone: "(11) 99111-2222",
        email: "carlos.edu@gmail.com",
        vehicleModel: "Honda Civic Sedan EXL",
        vehiclePlate: "BRA2E26",
        vehicleColor: "Preto Cristal"
    },
    {
        id: "c-2",
        name: "Ana Julia Moreira",
        phone: "(11) 98888-7777",
        email: "ana.julia@hotmail.com",
        vehicleModel: "Jeep Compass Longitude",
        vehiclePlate: "QWZ8H45",
        vehicleColor: "Cinza Granite"
    },
    {
        id: "c-3",
        name: "Bruno Albuquerque Medeiros",
        phone: "(21) 97555-4444",
        email: "bruno.alb@outlook.com",
        vehicleModel: "Toyota Corolla XEi",
        vehiclePlate: "LSU4J89",
        vehicleColor: "Branco Polar"
    }
];

const mockBudgets = [
    {
        id: "b-0001",
        clientId: "c-1",
        date: "2026-05-20",
        vehicleModel: "Honda Civic Sedan EXL",
        vehiclePlate: "BRA2E26",
        vehicleColor: "Preto Cristal",
        items: [
            { description: "Polimento Técnico Comercial de 3 Etapas", qtd: 1, unitValue: 650.00 },
            { description: "Vitrificação de Pintura com Proteção Gyeon de 3 anos", qtd: 1, unitValue: 1200.00 },
            { description: "Higienização Interna Completa com Detalhamento de Painel", qtd: 1, unitValue: 350.00 }
        ],
        discount: 150.00,
        total: 2050.00,
        status: "Em Aberto",
        payment: "Pix (com 5% de desconto), Cartão de Crédito em até 6x sem juros, ou Dinheiro.",
        delivery: "3 dias úteis após a entrega.",
        warranty: "12 meses para Vitrificação, 3 meses para Higienização e Polimento Técnico.",
        notice: "Este orçamento tem validade de 15 dias. Sujeito a revisão."
    },
    {
        id: "b-0002",
        clientId: "c-2",
        date: "2026-05-18",
        vehicleModel: "Jeep Compass Longitude",
        vehiclePlate: "QWZ8H45",
        vehicleColor: "Cinza Granite",
        items: [
            { description: "Lavagem Detalhada com Cera de Carnaúba Premium", qtd: 1, unitValue: 180.00 },
            { description: "Revitalização e Hidratação de Bancos de Couro", qtd: 1, unitValue: 220.00 }
        ],
        discount: 0.00,
        total: 400.00,
        status: "Aprovado",
        payment: "Pix (com 5% de desconto) ou Cartão.",
        delivery: "1 dia útil.",
        warranty: "3 meses para hidratação de couro.",
        notice: "Válido por 10 dias."
    }
];

// 2. ESTADO GLOBAL DO APLICATIVO
let company = {};
let settings = {};
let clients = [];
let budgets = [];
let currentFilterClient = ""; // Filtro ativo por pasta de cliente

// 3. INICIALIZAÇÃO E CARREGAMENTO DE DADOS
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Carrega do LocalStorage ou define Mocks
    company = loadData("ab_company", mockCompany);
    settings = loadData("ab_settings", mockSettings);
    clients = loadData("ab_clients", mockClients);
    budgets = loadData("ab_budgets", mockBudgets);
    
    // Executa rotina de expiração de orçamentos (retenção)
    runRetentionCheck();

    // Atualiza UIs principais
    updateMiniProfile();
    populateCompanyConfigForm();
    populateSettingsForm();
    
    // Renderiza dados nas abas
    renderDashboard();
    renderBudgetsTable();
    renderClientsTable();
    populateClientSelects();
    
    // Inicializa a data atual no formulário de novos orçamentos
    document.getElementById("budgetDate").value = new Date().toISOString().split('T')[0];
}

// Helpers de LocalStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key, defaultData) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
}

// Rotina de Expiração de Orçamentos (Retenção)
function runRetentionCheck() {
    if (!settings.retentionDays || settings.retentionDays <= 0) return;
    
    const today = new Date();
    const beforeLength = budgets.length;
    
    budgets = budgets.filter(budget => {
        const budgetDate = new Date(budget.date);
        const differenceInTime = today.getTime() - budgetDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        
        // Mantém apenas orçamentos mais novos que o prazo de retenção ou os aprovados/finalizados (segurança)
        return differenceInDays <= settings.retentionDays || budget.status === "Aprovado" || budget.status === "Finalizado";
    });
    
    if (budgets.length < beforeLength) {
        saveData("ab_budgets", budgets);
        showToast(`${beforeLength - budgets.length} orçamento(s) antigo(s) foram arquivados/excluídos automaticamente pelo prazo de retenção.`, "warning");
    }
}

// 4. CONFIGURAÇÃO DE LISTENERS DE EVENTOS
function setupEventListeners() {
    // Navegação por abas
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = item.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Botão de Novo Orçamento Rápido (Cabeçalho e Dashboard)
    document.getElementById("btnQuickCreate").addEventListener("click", () => {
        prepareNewBudgetForm();
        switchTab("editorcamento");
    });

    // Filtros de Orçamento
    document.getElementById("searchBudgetInput").addEventListener("input", renderBudgetsTable);
    document.getElementById("filterBudgetStatus").addEventListener("change", renderBudgetsTable);

    // Filtros de Clientes
    document.getElementById("searchClientInput").addEventListener("input", renderClientsTable);

    // Modais - Clientes
    document.getElementById("btnOpenAddClientModal").addEventListener("click", () => openClientModal());
    document.getElementById("btnQuickAddClient").addEventListener("click", () => openClientModal());
    document.getElementById("btnCloseClientModal").addEventListener("click", closeClientModal);
    document.getElementById("btnCancelClientModal").addEventListener("click", closeClientModal);
    document.getElementById("formClient").addEventListener("submit", saveClientData);

    // Modais - Visualizador de PDF
    document.getElementById("btnClosePreviewModal").addEventListener("click", closePreviewModal);

    // Editor de Orçamento
    document.getElementById("budgetSelectClient").addEventListener("change", handleClientSelectInBudget);
    document.getElementById("btnAddBudgetItem").addEventListener("click", () => addBudgetItemRow());
    document.getElementById("budgetDiscount").addEventListener("input", calculateBudgetTotals);
    document.getElementById("btnCancelBudget").addEventListener("click", () => {
        if(confirm("Deseja realmente cancelar? Alterações não salvas serão perdidas.")) {
            switchTab("dashboard");
        }
    });
    document.getElementById("formBudget").addEventListener("submit", saveBudgetData);

    // Configurações - Empresa
    document.getElementById("btnUploadLogo").addEventListener("click", () => {
        document.getElementById("companyLogoInput").click();
    });
    document.getElementById("companyLogoInput").addEventListener("change", handleLogoUpload);
    document.getElementById("btnRemoveLogo").addEventListener("click", removeCompanyLogo);
    document.getElementById("formCompany").addEventListener("submit", saveCompanyData);

    // Configurações - Sistema
    document.getElementById("formSystemSettings").addEventListener("submit", saveSystemSettings);

    // Configurações - Importação/Exportação Backup
    document.getElementById("btnExportBackup").addEventListener("click", exportSystemBackup);
    document.getElementById("btnTriggerImport").addEventListener("click", () => {
        document.getElementById("importBackupInput").click();
    });
    document.getElementById("importBackupInput").addEventListener("change", importSystemBackup);
}

// 5. SISTEMA DE COMPONENTES DE ABAS
function switchTab(tabId) {
    // Remove active classes
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));

    // Add active classes
    const activeNavItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNavItem) activeNavItem.classList.add("active");
    
    // Trata abas virtuais ou especiais
    let targetSectionId = `tab-${tabId}`;
    if (tabId === "editorcamento") {
        targetSectionId = "tab-editorcamento";
    }
    
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) targetSection.classList.add("active");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Atualiza cabeçalho dinamicamente
    const h1 = document.getElementById("pageTitle");
    const p = document.getElementById("pageSubtitle");
    
    // Reseta filtro de pasta ao mudar para aba geral de orçamentos se não viemos de lá
    if (tabId !== "orcamentos") {
        currentFilterClient = "";
    }

    switch(tabId) {
        case "dashboard":
            h1.innerText = "Painel de Controle";
            p.innerText = "Resumo atualizado da sua estética automotiva.";
            renderDashboard();
            break;
        case "orcamentos":
            h1.innerText = "Orçamentos Cadastrados";
            if (currentFilterClient) {
                const c = clients.find(cl => cl.id === currentFilterClient);
                p.innerText = `Mostrando orçamentos filtrados para o cliente: ${c ? c.name : ''}`;
            } else {
                p.innerText = "Consulte, edite ou crie novos orçamentos para exportar.";
            }
            renderBudgetsTable();
            break;
        case "clientes":
            h1.innerText = "Base de Clientes";
            p.innerText = "Gerencie seus clientes e seus veículos cadastrados.";
            renderClientsTable();
            break;
        case "configuracoes":
            h1.innerText = "Configurações Gerais";
            p.innerText = "Personalize o cabeçalho, logo e textos do seu PDF.";
            break;
        case "editorcamento":
            // Título é alterado dinamicamente no método de preparação
            break;
    }
}

// 6. RENDERIZAÇÃO DO DASHBOARD (PAINEL)
function renderDashboard() {
    // 1. Cálculos de métricas
    const openBudgets = budgets.filter(b => b.status === "Em Aberto");
    const approvedBudgets = budgets.filter(b => b.status === "Aprovado");
    
    document.getElementById("metricOpenBudgets").innerText = openBudgets.length;
    document.getElementById("metricApprovedBudgets").innerText = approvedBudgets.length;
    document.getElementById("metricTotalClients").innerText = clients.length;

    // Calcular faturamento do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTotal = budgets
        .filter(b => {
            const bDate = new Date(b.date);
            return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear && bDate.status !== "Cancelado";
        })
        .reduce((sum, b) => sum + parseFloat(b.total || 0), 0);

    document.getElementById("metricMonthlyValue").innerText = formatCurrency(monthlyTotal);

    // 2. Renderizar Tabela de Recentes Em Aberto (Máximo 5)
    const tbodyRecent = document.querySelector("#tableRecentOpenBudgets tbody");
    tbodyRecent.innerHTML = "";
    
    const openRecentList = [...openBudgets]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (openRecentList.length === 0) {
        document.getElementById("emptyRecentBudgets").style.display = "flex";
        document.getElementById("tableRecentOpenBudgets").style.display = "none";
    } else {
        document.getElementById("emptyRecentBudgets").style.display = "none";
        document.getElementById("tableRecentOpenBudgets").style.display = "table";
        
        openRecentList.forEach(budget => {
            const client = clients.find(c => c.id === budget.clientId) || { name: "Cliente Removido" };
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${budget.id.replace('b-', '')}</strong></td>
                <td>${client.name}</td>
                <td><small>${budget.vehicleModel || 'N/A'}</small></td>
                <td>${formatDateBR(budget.date)}</td>
                <td><strong>${formatCurrency(budget.total)}</strong></td>
                <td class="actions-col">
                    <div class="actions-btn-group">
                        <button class="btn-action view" onclick="openBudgetPreview('${budget.id}')" title="Visualizar/Exportar"><i class="fa-solid fa-file-pdf"></i></button>
                        <button class="btn-action edit" onclick="prepareEditBudget('${budget.id}')" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    </div>
                </td>
            `;
            tbodyRecent.appendChild(tr);
        });
    }

    // 3. Renderizar Pastas de Clientes Alfabeticamente
    const foldersContainer = document.getElementById("clientFoldersContainer");
    foldersContainer.innerHTML = "";

    if (clients.length === 0) {
        document.getElementById("emptyClientFolders").style.display = "flex";
        foldersContainer.style.display = "none";
    } else {
        document.getElementById("emptyClientFolders").style.display = "none";
        foldersContainer.style.display = "grid";

        // Ordena clientes em ordem alfabética
        const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

        sortedClients.forEach(client => {
            const clientBudgets = budgets.filter(b => b.clientId === client.id);
            const initialLetter = client.name.charAt(0).toUpperCase();
            
            const folderCard = document.createElement("div");
            folderCard.className = "client-folder-card";
            folderCard.onclick = () => filterBudgetsByClientFolder(client.id);
            
            folderCard.innerHTML = `
                <div class="folder-icon">
                    <i class="fa-solid fa-folder-closed"></i>
                    <span class="folder-letter">${initialLetter}</span>
                </div>
                <div class="folder-name" title="${client.name}">${client.name}</div>
                <div class="folder-count">${clientBudgets.length} orçamento(s)</div>
            `;
            foldersContainer.appendChild(folderCard);
        });
    }
}

// Filtra orçamentos ao clicar na pasta do cliente
function filterBudgetsByClientFolder(clientId) {
    currentFilterClient = clientId;
    switchTab("orcamentos");
}

// 7. CRUD DE CLIENTES
function renderClientsTable() {
    const tbody = document.querySelector("#tableAllClients tbody");
    tbody.innerHTML = "";

    const searchVal = document.getElementById("searchClientInput").value.toLowerCase();
    
    // Filtro
    let filteredClients = clients.filter(c => {
        return c.name.toLowerCase().includes(searchVal) ||
               c.phone.includes(searchVal) ||
               c.email.toLowerCase().includes(searchVal) ||
               (c.vehicleModel && c.vehicleModel.toLowerCase().includes(searchVal)) ||
               (c.vehiclePlate && c.vehiclePlate.toLowerCase().includes(searchVal));
    });

    // Ordenar alfabeticamente
    filteredClients.sort((a, b) => a.name.localeCompare(b.name));

    if (filteredClients.length === 0) {
        document.getElementById("emptyAllClients").style.display = "flex";
        document.getElementById("tableAllClients").style.display = "none";
    } else {
        document.getElementById("emptyAllClients").style.display = "none";
        document.getElementById("tableAllClients").style.display = "table";

        filteredClients.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${c.name}</strong></td>
                <td><small>${c.phone}</small></td>
                <td><small>${c.email || '-'}</small></td>
                <td>${c.vehicleModel || '-'}</td>
                <td><small>${c.vehiclePlate || '-'} / ${c.vehicleColor || '-'}</small></td>
                <td class="actions-col">
                    <div class="actions-btn-group">
                        <button class="btn-action edit" onclick="openClientModal('${c.id}')" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-action delete" onclick="deleteClient('${c.id}')" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function openClientModal(clientId = "") {
    const modal = document.getElementById("modalClient");
    const form = document.getElementById("formClient");
    const title = document.getElementById("clientModalTitle");
    
    form.reset();
    document.getElementById("editClientId").value = clientId;

    if (clientId) {
        title.innerText = "Editar Cadastro do Cliente";
        const client = clients.find(c => c.id === clientId);
        if (client) {
            document.getElementById("clientName").value = client.name;
            document.getElementById("clientPhone").value = client.phone;
            document.getElementById("clientEmail").value = client.email;
            document.getElementById("clientVehicleModel").value = client.vehicleModel;
            document.getElementById("clientVehiclePlate").value = client.vehiclePlate;
            document.getElementById("clientVehicleColor").value = client.vehicleColor;
        }
    } else {
        title.innerText = "Cadastrar Novo Cliente";
    }

    modal.classList.add("open");
}

function closeClientModal() {
    document.getElementById("modalClient").classList.remove("open");
}

function saveClientData(e) {
    e.preventDefault();
    
    const id = document.getElementById("editClientId").value;
    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const vehicleModel = document.getElementById("clientVehicleModel").value.trim();
    const vehiclePlate = document.getElementById("clientVehiclePlate").value.trim().toUpperCase();
    const vehicleColor = document.getElementById("clientVehicleColor").value.trim();

    if (!name || !phone || !vehicleModel || !vehiclePlate || !vehicleColor) {
        showToast("Por favor, preencha todos os campos obrigatórios (*).", "danger");
        return;
    }

    if (id) {
        // Editar existente
        clients = clients.map(c => {
            if (c.id === id) {
                return { ...c, name, phone, email, vehicleModel, vehiclePlate, vehicleColor };
            }
            return c;
        });
        showToast("Cliente atualizado com sucesso!", "success");
    } else {
        // Adicionar novo
        const newClient = {
            id: "c-" + Date.now(),
            name, phone, email, vehicleModel, vehiclePlate, vehicleColor
        };
        clients.push(newClient);
        showToast("Novo cliente cadastrado com sucesso!", "success");
    }

    saveData("ab_clients", clients);
    closeClientModal();
    renderClientsTable();
    populateClientSelects();
    renderDashboard();
}

function deleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Verificar se possui orçamentos atrelados
    const clientBudgets = budgets.filter(b => b.clientId === clientId);
    let msg = `Tem certeza que deseja excluir o cliente "${client.name}"?`;
    if (clientBudgets.length > 0) {
        msg += `\nATENÇÃO: Este cliente possui ${clientBudgets.length} orçamento(s) cadastrados. Eles continuarão no sistema, mas sem o vínculo do cadastro.`;
    }

    if (confirm(msg)) {
        clients = clients.filter(c => c.id !== clientId);
        saveData("ab_clients", clients);
        showToast("Cliente removido com sucesso.", "warning");
        renderClientsTable();
        populateClientSelects();
        renderDashboard();
    }
}

// 8. CRUD DE ORÇAMENTOS & EDITOR
function renderBudgetsTable() {
    const tbody = document.querySelector("#tableAllBudgets tbody");
    tbody.innerHTML = "";

    const searchVal = document.getElementById("searchBudgetInput").value.toLowerCase();
    const statusVal = document.getElementById("filterBudgetStatus").value;

    let filtered = budgets;

    // Filtro por Pasta do Cliente (se clicado no dashboard)
    if (currentFilterClient) {
        filtered = filtered.filter(b => b.clientId === currentFilterClient);
    }

    // Filtro de Busca Geral
    if (searchVal) {
        filtered = filtered.filter(b => {
            const client = clients.find(c => c.id === b.clientId) || { name: "" };
            return b.id.toLowerCase().includes(searchVal) ||
                   client.name.toLowerCase().includes(searchVal) ||
                   (b.vehicleModel && b.vehicleModel.toLowerCase().includes(searchVal)) ||
                   (b.vehiclePlate && b.vehiclePlate.toLowerCase().includes(searchVal));
        });
    }

    // Filtro de Status
    if (statusVal !== "all") {
        filtered = filtered.filter(b => b.status === statusVal);
    }

    // Ordenar do mais recente para o mais antigo
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        document.getElementById("emptyAllBudgets").style.display = "flex";
        document.getElementById("tableAllBudgets").style.display = "none";
    } else {
        document.getElementById("emptyAllBudgets").style.display = "none";
        document.getElementById("tableAllBudgets").style.display = "table";

        filtered.forEach(b => {
            const client = clients.find(c => c.id === b.clientId) || { name: "Cliente Removido" };
            const statusClass = b.status.toLowerCase().replace(" ", "");
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${b.id.replace('b-', '')}</strong></td>
                <td>${client.name}</td>
                <td>${b.vehicleModel || '-'} <br><small class="text-muted">${b.vehiclePlate || '-'}</small></td>
                <td>${formatDateBR(b.date)}</td>
                <td><strong>${formatCurrency(b.total)}</strong></td>
                <td><span class="badge ${statusClass}">${b.status}</span></td>
                <td class="actions-col">
                    <div class="actions-btn-group">
                        <button class="btn-action view" onclick="openBudgetPreview('${b.id}')" title="Visualizar/Exportar"><i class="fa-solid fa-file-pdf"></i></button>
                        <button class="btn-action edit" onclick="prepareEditBudget('${b.id}')" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-action delete" onclick="deleteBudget('${b.id}')" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function populateClientSelects() {
    const select = document.getElementById("budgetSelectClient");
    select.innerHTML = '<option value="">Selecione um cliente cadastrado...</option>';
    
    // Ordem alfabética
    const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedClients.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

function handleClientSelectInBudget() {
    const clientId = document.getElementById("budgetSelectClient").value;
    const detailsBox = document.getElementById("budgetClientDetailsBox");
    
    if (!clientId) {
        detailsBox.style.display = "none";
        detailsBox.innerHTML = "";
        return;
    }

    const client = clients.find(c => c.id === clientId);
    if (client) {
        detailsBox.style.display = "flex";
        detailsBox.innerHTML = `
            <div class="mini-card-item">
                <span class="mini-card-label">Telefone:</span>
                <span class="mini-card-val">${client.phone}</span>
            </div>
            <div class="mini-card-item">
                <span class="mini-card-label">E-mail:</span>
                <span class="mini-card-val">${client.email || 'Não cadastrado'}</span>
            </div>
            <div class="mini-card-item">
                <span class="mini-card-label">Veículo Padrão:</span>
                <span class="mini-card-val">${client.vehicleModel} (${client.vehicleColor})</span>
            </div>
            <div class="mini-card-item">
                <span class="mini-card-label">Placa:</span>
                <span class="mini-card-val">${client.vehiclePlate}</span>
            </div>
        `;

        // Auto preenche os inputs do veículo (permitindo sobrescrever caso seja um orçamento para veículo diferente do padrão)
        document.getElementById("budgetVehicleModel").value = client.vehicleModel;
        document.getElementById("budgetVehiclePlate").value = client.vehiclePlate;
        document.getElementById("budgetVehicleColor").value = client.vehicleColor;
    }
}

function prepareNewBudgetForm() {
    const title = document.getElementById("budgetEditorTitle");
    const badge = document.getElementById("editorBudgetNumberBadge");
    const form = document.getElementById("formBudget");
    
    title.innerHTML = '<i class="fa-solid fa-file-invoice"></i> Criar Novo Orçamento';
    badge.innerText = "Rascunho";
    form.reset();
    
    document.getElementById("editBudgetId").value = "";
    document.getElementById("budgetClientDetailsBox").style.display = "none";
    document.getElementById("budgetClientDetailsBox").innerHTML = "";

    // Limpa e inicializa os itens da tabela (cria 1 linha vazia padrão)
    const tbody = document.getElementById("budgetItemsBody");
    tbody.innerHTML = "";
    addBudgetItemRow();

    // Data atual
    document.getElementById("budgetDate").value = new Date().toISOString().split('T')[0];

    // Carregar textos padrões
    document.getElementById("budgetPayment").value = settings.defaultPayment || "";
    document.getElementById("budgetDelivery").value = settings.defaultDelivery || "";
    document.getElementById("budgetWarranty").value = settings.defaultWarranty || "";
    document.getElementById("budgetNotice").value = settings.defaultNotice || "";

    // Status inicial
    document.getElementById("budgetStatus").value = "Em Aberto";
    calculateBudgetTotals();
}

function addBudgetItemRow(itemData = { description: "", qtd: 1, unitValue: 0.00 }) {
    const tbody = document.getElementById("budgetItemsBody");
    const rowCount = tbody.rows.length;
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td class="row-index">${rowCount + 1}</td>
        <td>
            <input type="text" class="item-desc" required placeholder="Ex: Lavagem Detalhada ou Polimento" value="${itemData.description}">
        </td>
        <td>
            <input type="number" class="item-qtd" min="1" required value="${itemData.qtd}" oninput="calculateBudgetTotals()">
        </td>
        <td>
            <input type="number" class="item-val" min="0" step="0.01" required value="${parseFloat(itemData.unitValue).toFixed(2)}" oninput="calculateBudgetTotals()">
        </td>
        <td>
            <input type="text" class="item-total-display" readonly value="R$ 0,00" style="font-weight:700; background-color:rgba(0,0,0,0.15)">
        </td>
        <td class="actions-col">
            <button type="button" class="btn-action delete btn-delete-item" onclick="removeBudgetItemRow(this)"><i class="fa-solid fa-trash-can"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
    calculateBudgetTotals();
}

function removeBudgetItemRow(button) {
    const tr = button.closest("tr");
    const tbody = document.getElementById("budgetItemsBody");
    
    if (tbody.rows.length <= 1) {
        showToast("O orçamento deve conter pelo menos 1 serviço ou produto.", "warning");
        return;
    }

    tr.remove();
    
    // Reajusta os números dos itens
    Array.from(tbody.rows).forEach((row, idx) => {
        row.cells[0].innerText = idx + 1;
    });

    calculateBudgetTotals();
}

function calculateBudgetTotals() {
    const rows = document.querySelectorAll("#budgetItemsBody tr");
    let subtotal = 0;

    rows.forEach(row => {
        const qtdInput = row.querySelector(".item-qtd");
        const valInput = row.querySelector(".item-val");
        const totalDisp = row.querySelector(".item-total-display");

        const qtd = parseInt(qtdInput.value) || 0;
        const val = parseFloat(valInput.value) || 0.0;
        const total = qtd * val;

        totalDisp.value = formatCurrency(total);
        subtotal += total;
    });

    const discountInput = document.getElementById("budgetDiscount");
    const discount = parseFloat(discountInput.value) || 0.0;
    
    let grandTotal = subtotal - discount;
    if (grandTotal < 0) {
        grandTotal = 0;
        discountInput.value = subtotal.toFixed(2);
    }

    document.getElementById("budgetSubtotal").innerText = formatCurrency(subtotal);
    document.getElementById("budgetGrandTotal").innerText = formatCurrency(grandTotal);
}

function saveBudgetData(e) {
    e.preventDefault();

    const id = document.getElementById("editBudgetId").value;
    const clientId = document.getElementById("budgetSelectClient").value;
    const date = document.getElementById("budgetDate").value;
    const vehicleModel = document.getElementById("budgetVehicleModel").value.trim();
    const vehiclePlate = document.getElementById("budgetVehiclePlate").value.trim().toUpperCase();
    const vehicleColor = document.getElementById("budgetVehicleColor").value.trim();
    
    const discount = parseFloat(document.getElementById("budgetDiscount").value) || 0.0;
    const status = document.getElementById("budgetStatus").value;

    const payment = document.getElementById("budgetPayment").value.trim();
    const delivery = document.getElementById("budgetDelivery").value.trim();
    const warranty = document.getElementById("budgetWarranty").value.trim();
    const notice = document.getElementById("budgetNotice").value.trim();

    if (!clientId || !date) {
        showToast("Preencha o cliente e a data de emissão.", "danger");
        return;
    }

    // Coletar itens
    const rows = document.querySelectorAll("#budgetItemsBody tr");
    const items = [];
    let isValidItems = true;

    rows.forEach(row => {
        const desc = row.querySelector(".item-desc").value.trim();
        const qtd = parseInt(row.querySelector(".item-qtd").value) || 0;
        const unitValue = parseFloat(row.querySelector(".item-val").value) || 0.0;

        if (!desc || qtd <= 0) {
            isValidItems = false;
        }

        items.push({ description: desc, qtd, unitValue });
    });

    if (!isValidItems || items.length === 0) {
        showToast("Todos os itens devem conter descrição válida e quantidade maior que zero.", "danger");
        return;
    }

    // Calcula total final
    const subtotal = items.reduce((sum, item) => sum + (item.qtd * item.unitValue), 0);
    const total = subtotal - discount;

    if (id) {
        // Edição
        budgets = budgets.map(b => {
            if (b.id === id) {
                return {
                    ...b, clientId, date, vehicleModel, vehiclePlate, vehicleColor,
                    items, discount, total, status, payment, delivery, warranty, notice
                };
            }
            return b;
        });
        showToast("Orçamento atualizado com sucesso!", "success");
    } else {
        // Novo. Gerar número sequencial único
        const nextNum = getNextBudgetSequentialNumber();
        const newBudget = {
            id: `b-${nextNum}`,
            clientId, date, vehicleModel, vehiclePlate, vehicleColor,
            items, discount, total, status, payment, delivery, warranty, notice
        };
        budgets.push(newBudget);
        showToast(`Orçamento Nº ${nextNum} criado com sucesso!`, "success");
    }

    saveData("ab_budgets", budgets);
    switchTab("dashboard");
}

function getNextBudgetSequentialNumber() {
    if (budgets.length === 0) return "0001";
    
    // Extrair os números dos IDs, converter para inteiro e achar o maior
    const numbers = budgets.map(b => {
        const cleanId = b.id.replace('b-', '');
        return parseInt(cleanId) || 0;
    });

    const maxNum = Math.max(...numbers, 0);
    const nextNum = maxNum + 1;
    
    // Formata com preenchimento de zeros à esquerda (ex: 0005)
    return String(nextNum).padStart(4, '0');
}

function prepareEditBudget(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    prepareNewBudgetForm(); // Reseta tudo primeiro

    const title = document.getElementById("budgetEditorTitle");
    const badge = document.getElementById("editorBudgetNumberBadge");
    
    title.innerHTML = '<i class="fa-solid fa-file-pen"></i> Editar Orçamento';
    badge.innerText = `Orçamento Nº ${budget.id.replace('b-', '')}`;

    document.getElementById("editBudgetId").value = budget.id;
    document.getElementById("budgetSelectClient").value = budget.clientId;
    handleClientSelectInBudget();

    document.getElementById("budgetDate").value = budget.date;
    document.getElementById("budgetVehicleModel").value = budget.vehicleModel || "";
    document.getElementById("budgetVehiclePlate").value = budget.vehiclePlate || "";
    document.getElementById("budgetVehicleColor").value = budget.vehicleColor || "";

    // Itens
    const tbody = document.getElementById("budgetItemsBody");
    tbody.innerHTML = "";
    budget.items.forEach(item => {
        addBudgetItemRow(item);
    });

    document.getElementById("budgetDiscount").value = budget.discount.toFixed(2);
    document.getElementById("budgetStatus").value = budget.status;

    // Observações
    document.getElementById("budgetPayment").value = budget.payment || "";
    document.getElementById("budgetDelivery").value = budget.delivery || "";
    document.getElementById("budgetWarranty").value = budget.warranty || "";
    document.getElementById("budgetNotice").value = budget.notice || "";

    calculateBudgetTotals();
    switchTab("editorcamento");
}

function deleteBudget(budgetId) {
    if (confirm(`Tem certeza que deseja remover permanentemente o orçamento Nº ${budgetId.replace('b-', '')}?`)) {
        budgets = budgets.filter(b => b.id !== budgetId);
        saveData("ab_budgets", budgets);
        showToast("Orçamento removido com sucesso.", "warning");
        renderBudgetsTable();
        renderDashboard();
    }
}

// 9. CONFIGURAÇÕES DA EMPRESA
function populateCompanyConfigForm() {
    document.getElementById("companyName").value = company.name || "";
    document.getElementById("companyCNPJ").value = company.cnpj || "";
    document.getElementById("companyPhone").value = company.phone || "";
    document.getElementById("companyEmail").value = company.email || "";
    document.getElementById("companyAddress").value = company.address || "";
    
    renderLogoPreview();
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.match('image.*')) {
        showToast("Formato de arquivo inválido. Selecione uma imagem.", "danger");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        company.logo = evt.target.result; // Salva o base64
        renderLogoPreview();
        showToast("Logo carregada com sucesso! Lembre-se de salvar os dados.", "success");
    };
    reader.readAsDataURL(file);
}

function renderLogoPreview() {
    const previewBox = document.getElementById("logoPreviewBox");
    const removeBtn = document.getElementById("btnRemoveLogo");
    
    if (company.logo) {
        previewBox.innerHTML = `<img src="${company.logo}" alt="Logomarca da Empresa">`;
        previewBox.classList.add("has-image");
        removeBtn.style.display = "inline-flex";
    } else {
        previewBox.innerHTML = `<i class="fa-solid fa-image"></i><span>Sua Logomarca</span>`;
        previewBox.classList.remove("has-image");
        removeBtn.style.display = "none";
    }
}

function removeCompanyLogo() {
    company.logo = "";
    renderLogoPreview();
    document.getElementById("companyLogoInput").value = "";
    showToast("Logotipo removido. Lembre-se de salvar os dados.", "warning");
}

function saveCompanyData(e) {
    e.preventDefault();

    const name = document.getElementById("companyName").value.trim();
    const cnpj = document.getElementById("companyCNPJ").value.trim();
    const phone = document.getElementById("companyPhone").value.trim();
    const email = document.getElementById("companyEmail").value.trim();
    const address = document.getElementById("companyAddress").value.trim();

    if (!name || !phone) {
        showToast("Nome da empresa e telefone são obrigatórios.", "danger");
        return;
    }

    company = { ...company, name, cnpj, phone, email, address };
    saveData("ab_company", company);
    updateMiniProfile();
    showToast("Dados da empresa salvos com sucesso!", "success");
}

function updateMiniProfile() {
    const profileBox = document.getElementById("miniCompanyProfile");
    const logoHtml = company.logo 
        ? `<img src="${company.logo}" alt="Logo">`
        : `<i class="fa-solid fa-building"></i>`;
    
    profileBox.innerHTML = `
        <div class="mini-logo-container">
            ${logoHtml}
        </div>
        <div class="mini-info">
            <span class="mini-name">${company.name || 'Minha Empresa'}</span>
            <span class="mini-sub">${company.phone || 'Configurar telefone'}</span>
        </div>
    `;
}

// 10. PREFERÊNCIAS DO SISTEMA
function populateSettingsForm() {
    document.getElementById("retentionDays").value = settings.retentionDays !== undefined ? settings.retentionDays : 180;
    document.getElementById("defaultPayment").value = settings.defaultPayment || "";
    document.getElementById("defaultDelivery").value = settings.defaultDelivery || "";
    document.getElementById("defaultWarranty").value = settings.defaultWarranty || "";
    document.getElementById("defaultNotice").value = settings.defaultNotice || "";
}

function saveSystemSettings(e) {
    e.preventDefault();

    const retentionDays = parseInt(document.getElementById("retentionDays").value);
    const defaultPayment = document.getElementById("defaultPayment").value.trim();
    const defaultDelivery = document.getElementById("defaultDelivery").value.trim();
    const defaultWarranty = document.getElementById("defaultWarranty").value.trim();
    const defaultNotice = document.getElementById("defaultNotice").value.trim();

    if (isNaN(retentionDays) || retentionDays < 0) {
        showToast("O prazo de retenção deve ser um número maior ou igual a zero.", "danger");
        return;
    }

    settings = { retentionDays, defaultPayment, defaultDelivery, defaultWarranty, defaultNotice };
    saveData("ab_settings", settings);
    showToast("Preferências salvas com sucesso!", "success");
    
    // Executa verificação caso prazo tenha encolhido
    runRetentionCheck();
}

// 11. SISTEMA DE BACKUP / RESTAURAÇÃO (JSON)
function exportSystemBackup() {
    const backupData = {
        company: loadData("ab_company", {}),
        settings: loadData("ab_settings", {}),
        clients: loadData("ab_clients", []),
        budgets: loadData("ab_budgets", [])
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const formattedDate = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `autobudge_backup_${formattedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Backup gerado e baixado com sucesso!", "success");
}

function importSystemBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showToast("Arquivo de backup inválido. Deve ser um arquivo .json", "danger");
        return;
    }

    if (confirm("ATENÇÃO: Importar um backup irá sobrescrever TODOS os dados atuais do aplicativo! Deseja continuar?")) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                
                // Validação mínima da estrutura do backup
                if (parsed.company && parsed.settings && Array.isArray(parsed.clients) && Array.isArray(parsed.budgets)) {
                    saveData("ab_company", parsed.company);
                    saveData("ab_settings", parsed.settings);
                    saveData("ab_clients", parsed.clients);
                    saveData("ab_budgets", parsed.budgets);

                    showToast("Backup importado com sucesso! Recarregando sistema...", "success");
                    
                    // Reinicializa o app
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast("Formato de backup corrompido ou incompatível.", "danger");
                }
            } catch (err) {
                showToast("Erro ao processar o arquivo de backup.", "danger");
            }
        };
        reader.readAsText(file);
    }
    // Reseta o input para permitir selecionar o mesmo arquivo se necessário
    document.getElementById("importBackupInput").value = "";
}

// 12. SISTEMA DE TOAST NOTIFICATIONS (MENSAGENS POP-UP)
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    if (type === "danger") iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === "warning") iconHtml = '<i class="fa-solid fa-circle-info"></i>';

    toast.innerHTML = `
        ${iconHtml}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Fade out e remoção após 4 segundos
    setTimeout(() => {
        toast.classList.add("fade-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

// 13. MÉTODOS AUXILIARES DE FORMATAÇÃO
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDateBR(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

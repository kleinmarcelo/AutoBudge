/* ==========================================================================
   AutoBudge - Sistema de Orçamentos Premium
   PDF Generation & Preview Logic (pdf.js)
   ========================================================================== */

let activePreviewBudgetId = "";

// 1. ABRIR E PREPARAR PRÉVIA DO ORÇAMENTO (RENDERIZAÇÃO HTML DO PDF)
function openBudgetPreview(budgetId) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) {
        showToast("Orçamento não encontrado.", "danger");
        return;
    }

    activePreviewBudgetId = budgetId;
    const client = clients.find(c => c.id === budget.clientId) || { 
        name: "Cliente Não Encontrado", 
        phone: "-", 
        email: "-", 
        vehicleModel: "-", 
        vehiclePlate: "-", 
        vehicleColor: "-" 
    };

    const printArea = document.getElementById("pdfPrintArea");
    printArea.innerHTML = ""; // Limpa a área

    // Constrói a estrutura interna do PDF simulado
    // Nota: O layout usa classes prefixadas com "pdf-" que foram estilizadas no style.css
    
    // Header com Logo e Título
    const headerHtml = `
        <div class="pdf-header-section">
            <div class="pdf-logo-area">
                ${company.logo 
                    ? `<img src="${company.logo}" alt="Logo Empresa">` 
                    : `<div class="pdf-logo-placeholder">[ ESPAÇO GRANDE PARA O LOGO ]</div>`}
            </div>
            <div class="pdf-title-area">
                <h1>Orçamento de<br>Estética Automotiva</h1>
            </div>
        </div>
    `;

    // Seção 1: Dados da Empresa
    const companySectionHtml = `
        <div class="pdf-card-title">Dados da Empresa</div>
        <table class="pdf-data-table">
            <tr>
                <td style="width: 60%;">
                    <strong>${company.name || 'Nome da Empresa'}</strong><br>
                    Endereco: ${company.address || '[Sua Rua, Número, Bairro, Cidade - UF]'}<br>
                    Telefone / WhatsApp: ${company.phone || '(XX) XXXXX-XXXX'}<br>
                    E-mail: ${company.email || 'contato@suaempresa.com.br'}<br>
                    CNPJ: ${company.cnpj || 'XX.XXX.XXX/0001-XX'}
                </td>
                <td style="width: 40%; vertical-align: top;">
                    <strong>Orçamento Nº:</strong> ${budget.id.replace('b-', '')}<br>
                    <strong>Data:</strong> ${formatDateBR(budget.date)}
                </td>
            </tr>
        </table>
    `;

    // Seção 2: Informações do Cliente
    const clientSectionHtml = `
        <div class="pdf-card-title">Informações do Cliente</div>
        <table class="pdf-data-table" style="margin-bottom: 25px;">
            <tr>
                <td style="width: 50%;"><strong>Nome do Cliente:</strong> ${client.name}</td>
                <td style="width: 50%;"></td>
            </tr>
            <tr>
                <td><strong>Telefone / WhatsApp:</strong> ${budget.clientId === client.id ? budget.vehicleModel === client.vehicleModel ? client.phone : client.phone : '-' }</td>
                <td><strong>E-mail:</strong> ${client.email || '-'}</td>
            </tr>
            <tr>
                <td><strong>Veículo / Modelo:</strong> ${budget.vehicleModel || '-'}</td>
                <td></td>
            </tr>
            <tr>
                <td><strong>Placa:</strong> ${budget.vehiclePlate || '-'}</td>
                <td><strong>Cor:</strong> ${budget.vehicleColor || '-'}</td>
            </tr>
        </table>
    `;

    // Seção 3: Tabela de Itens (Serviços / Produtos)
    let itemsRowsHtml = "";
    let subtotal = 0;

    budget.items.forEach((item, index) => {
        const itemTotal = item.qtd * item.unitValue;
        subtotal += itemTotal;
        itemsRowsHtml += `
            <tr>
                <td class="pdf-text-center">${index + 1}</td>
                <td>${item.description}</td>
                <td class="pdf-text-center">${item.qtd}</td>
                <td class="pdf-text-right">${formatCurrency(item.unitValue)}</td>
                <td class="pdf-text-right">${formatCurrency(itemTotal)}</td>
            </tr>
        `;
    });

    const itemsSectionHtml = `
        <div class="pdf-card-title">Detalhes do Orçamento</div>
        <table class="pdf-items-table">
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">Item</th>
                    <th style="width: 52%; text-align: left;">Descrição do Serviço / Produto</th>
                    <th style="width: 10%; text-align: center;">Qtd</th>
                    <th style="width: 15%; text-align: right;">V. Unitário</th>
                    <th style="width: 15%; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRowsHtml}
            </tbody>
        </table>
    `;

    // Seção 4: Totais
    const totalsBoxHtml = `
        <div class="pdf-totals-box">
            <div class="pdf-totals-row">
                <span>Subtotal:</span>
                <strong>${formatCurrency(subtotal)}</strong>
            </div>
            <div class="pdf-totals-row">
                <span>Desconto:</span>
                <strong>${formatCurrency(budget.discount)}</strong>
            </div>
            <div class="pdf-totals-row grand-total">
                <span>Valor Total:</span>
                <strong>${formatCurrency(budget.total)}</strong>
            </div>
        </div>
    `;

    // Seção 5: Observações e Condições
    const conditionsHtml = `
        <div class="pdf-conditions-section">
            <h3>Observações e Condições</h3>
            <ul class="pdf-conditions-list">
                ${budget.payment ? `<li><strong>Formas de pagamento aceitas:</strong> ${budget.payment}</li>` : ''}
                ${budget.delivery ? `<li><strong>Prazo estimado para entrega do veículo:</strong> ${budget.delivery}</li>` : ''}
                ${budget.warranty ? `<li><strong>Os serviços descritos contam com garantia de:</strong> ${budget.warranty}</li>` : ''}
                <li>A remoção de pertences pessoais do interior do veículo é de responsabilidade do cliente antes da entrega para a realização dos serviços.</li>
                ${budget.notice ? `<li><strong>Aviso:</strong> ${budget.notice}</li>` : ''}
            </ul>
        </div>
    `;

    // Monta tudo no container
    printArea.innerHTML = `
        ${headerHtml}
        ${companySectionHtml}
        ${clientSectionHtml}
        ${itemsSectionHtml}
        ${totalsBoxHtml}
        ${conditionsHtml}
    `;

    // Abre o modal
    document.getElementById("modalPreview").classList.add("open");
}

function closePreviewModal() {
    document.getElementById("modalPreview").classList.remove("open");
    activePreviewBudgetId = "";
}

// 2. EXPORTAR PDF USANDO HTML2PDF.JS
function downloadBudgetPDF() {
    if (!activePreviewBudgetId) return;

    const budget = budgets.find(b => b.id === activePreviewBudgetId);
    if (!budget) return;

    const client = clients.find(c => c.id === budget.clientId) || { name: "Cliente" };
    
    // Mostra Toast de processamento
    showToast("Gerando documento PDF de alta qualidade...", "warning");

    const printElement = document.getElementById("pdfPrintArea");
    
    // Limpar caracteres especiais para o nome do arquivo
    const cleanClientName = client.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 20);

    const budgetNum = budget.id.replace('b-', '');
    const filename = `orcamento_${budgetNum}_${cleanClientName}.pdf`;

    // Configurações sofisticadas da biblioteca html2pdf.js
    const opt = {
        margin:       [12, 12, 12, 12],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, // Aumenta a resolução do canvas para impressão nítida
            useCORS: true, 
            letterRendering: true,
            logging: false
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Executa a conversão do elemento HTML para o arquivo PDF de download
    html2pdf().set(opt).from(printElement).save().then(() => {
        showToast("PDF baixado com sucesso!", "success");
    }).catch(err => {
        showToast("Ocorreu um erro ao gerar o PDF.", "danger");
        console.error(err);
    });
}

// Vincula o botão de download no modal à função de download
document.getElementById("btnDownloadPDF").addEventListener("click", downloadBudgetPDF);

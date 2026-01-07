const TAXAS = {
    ir: 0.20,
    mesa: 0.10,
    rpa: 0.11,
    iss: 0.05
};

// --- Funções de Formatação ---
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function aplicarMascaraMoeda(event) {
    const input = event.target;
    let valor = input.value;
    valor = valor.replace(/\D/g, "");
    if (valor === "") {
        input.value = "";
        return;
    }
    valor = (parseInt(valor) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    input.value = valor;
}

function getInputValue(id) {
    const value = document.getElementById(id).value;
    if (!value) return 0;
    const numeroLimpo = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(numeroLimpo);
}

// --- Lógica de Cálculo ---
function calcularResultado() {
    let valorAtual = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    
    // Lista Visual (O "Extrato" acima dos botões)
    let extratoHTML = '';
    extratoHTML += criarLinha("Resultado Mensal", valorAtual, "bruto");

    const valorIR = valorAtual * TAXAS.ir;
    valorAtual -= valorIR; 
    extratoHTML += criarLinha("(-) Imposto de Renda (20%)", -valorIR, "desconto");
    
    extratoHTML += criarLinha("Resultado após IR", valorAtual, "subtotal");

    const valorMesa = valorAtual * TAXAS.mesa;
    valorAtual -= valorMesa; 
    extratoHTML += criarLinha("(-) Lucro da Mesa (10%)", -valorMesa, "desconto");

    extratoHTML += criarLinha("Lucro do Trader", valorAtual, "subtotal");

    if (saldoDevedor > 0) {
        valorAtual -= saldoDevedor;
        extratoHTML += criarLinha("(-) Abatimento Saldo Devedor", -saldoDevedor, "desconto");
    }

    // Valor Líquido Base (PJ)
    const valorLiquidoFinal = valorAtual; 

    document.getElementById('statementList').innerHTML = extratoHTML;

    // Controle de Exibição
    const resultsSection = document.getElementById('resultsSection');
    const negativeContainer = document.getElementById('negativeResultContainer');
    const positiveSelectionContainer = document.getElementById('positiveSelectionContainer');
    
    resetSelection();
    resultsSection.classList.remove('hidden');

    if (valorLiquidoFinal < 0) {
        // Devedor: Usamos Math.abs para tirar o sinal de menos
        negativeContainer.classList.remove('hidden');
        positiveSelectionContainer.classList.add('hidden');
        document.getElementById('valDevedorFinal').textContent = formatarMoeda(Math.abs(valorLiquidoFinal));
    } else {
        // Positivo
        negativeContainer.classList.add('hidden');
        positiveSelectionContainer.classList.remove('hidden');

        prepararDadosPJ(getInputValue('resultadoMensal'), saldoDevedor);
        prepararDadosPF(getInputValue('resultadoMensal'), saldoDevedor);
    }
}

// Monta o Card PJ Detalhado
function prepararDadosPJ(brutoInicial, dividaInicial) {
    let html = '';
    let corrente = brutoInicial;

    html += criarItemInner("Resultado Mensal", corrente, "pos");

    const ir = brutoInicial * TAXAS.ir;
    corrente -= ir;
    html += criarItemInner("(-) Imposto de Renda", -ir, "neg");

    const mesa = corrente * TAXAS.mesa;
    corrente -= mesa;
    html += criarItemInner("(-) Lucro da Mesa", -mesa, "neg");

    if (dividaInicial > 0) {
        corrente -= dividaInicial;
        html += criarItemInner("(-) Saldo Devedor", -dividaInicial, "neg");
    }

    document.getElementById('listPJ').innerHTML = html;
    document.getElementById('valFinalPJ').textContent = formatarMoeda(corrente);
}

// Monta o Card PF Detalhado
function prepararDadosPF(brutoInicial, dividaInicial) {
    let html = '';
    let corrente = brutoInicial;

    // 1. Refaz o caminho básico
    html += criarItemInner("Resultado Mensal", corrente, "pos");

    const ir = brutoInicial * TAXAS.ir;
    corrente -= ir;
    html += criarItemInner("(-) Imposto de Renda", -ir, "neg");

    const mesa = corrente * TAXAS.mesa;
    corrente -= mesa;
    html += criarItemInner("(-) Lucro da Mesa", -mesa, "neg");

    if (dividaInicial > 0) {
        corrente -= dividaInicial;
        html += criarItemInner("(-) Saldo Devedor", -dividaInicial, "neg");
    }

    // 2. Adiciona RPA e ISS
    const baseRPA = corrente;
    const valRPA = baseRPA * TAXAS.rpa;
    const valISS = baseRPA * TAXAS.iss;
    
    corrente = corrente - valRPA - valISS;

    html += criarItemInner("(-) RPA (11%)", -valRPA, "neg");
    html += criarItemInner("(-) ISS (5%)", -valISS, "neg");

    document.getElementById('listPF').innerHTML = html;
    document.getElementById('valFinalPF').textContent = formatarMoeda(corrente);
}

function resetSelection() {
    document.getElementById('detailsPJ').classList.add('hidden');
    document.getElementById('detailsPF').classList.add('hidden');
    document.getElementById('btnSelectPJ').classList.remove('active');
    document.getElementById('btnSelectPF').classList.remove('active');
}

function criarLinha(label, valor, tipo) {
    return `
        <li class="statement-item item-${tipo}">
            <span class="item-label">${label}</span>
            <span class="item-value">${formatarMoeda(valor)}</span>
        </li>
    `;
}

function criarItemInner(label, valor, tipoClass) {
    return `
        <li>
            <span>${label}</span>
            <span class="val-${tipoClass}">${formatarMoeda(valor)}</span>
        </li>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const inputsMoeda = document.querySelectorAll('.money-input');
    inputsMoeda.forEach(input => {
        input.addEventListener('input', aplicarMascaraMoeda);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });

    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);

    // Botões de Seleção
    const btnPJ = document.getElementById('btnSelectPJ');
    const btnPF = document.getElementById('btnSelectPF');
    const detailsPJ = document.getElementById('detailsPJ');
    const detailsPF = document.getElementById('detailsPF');

    btnPJ.addEventListener('click', () => {
        resetSelection();
        btnPJ.classList.add('active');
        detailsPJ.classList.remove('hidden');
    });

    btnPF.addEventListener('click', () => {
        resetSelection();
        btnPF.classList.add('active');
        detailsPF.classList.remove('hidden');
    });

    // Tooltip Mobile
    const btnHelp = document.getElementById('btnHelp');
    if (btnHelp) {
        btnHelp.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const tooltip = btnHelp.nextElementSibling; 
            if(tooltip) tooltip.classList.toggle('show-tooltip');
        });
    }

    document.addEventListener('click', () => {
        const allTooltips = document.querySelectorAll('.tooltip-text');
        allTooltips.forEach(t => t.classList.remove('show-tooltip'));
    });
});
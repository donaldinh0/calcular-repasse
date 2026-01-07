const TAXAS = {
    ir: 0.20,
    mesa: 0.10,
    rpa: 0.11,
    iss: 0.05
};

// --- Funções de Formatação (Máscara) ---
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
    
    let extratoHTML = '';

    // 1. Mensal
    extratoHTML += criarLinha("Resultado Mensal", valorAtual, "bruto");

    // 2. IR
    const valorIR = valorAtual * TAXAS.ir;
    valorAtual -= valorIR; 
    extratoHTML += criarLinha("(-) Imposto de Renda (20%)", -valorIR, "desconto");
    
    // Subtotal 1
    extratoHTML += criarLinha("Resultado após IR", valorAtual, "subtotal");

    // 3. Mesa
    const valorMesa = valorAtual * TAXAS.mesa;
    valorAtual -= valorMesa; 
    extratoHTML += criarLinha("(-) Lucro da Mesa (10%)", -valorMesa, "desconto");

    // Subtotal 2 (Lucro do Trader)
    extratoHTML += criarLinha("Lucro do Trader", valorAtual, "subtotal");

    // 4. Dívida
    if (saldoDevedor > 0) {
        valorAtual -= saldoDevedor;
        extratoHTML += criarLinha("(-) Abatimento Saldo Devedor", -saldoDevedor, "desconto");
    }

    // --- DECISÃO FINAL: Positivo ou Negativo? ---
    const valorLiquidoFinal = valorAtual; 

    // Renderiza a lista comum
    document.getElementById('statementList').innerHTML = extratoHTML;

    // Elementos de Controle
    const resultsSection = document.getElementById('resultsSection');
    const negativeContainer = document.getElementById('negativeResultContainer');
    const positiveSelectionContainer = document.getElementById('positiveSelectionContainer');
    
    // Reseta visualização dos detalhes
    resetSelection();

    resultsSection.classList.remove('hidden');

    if (valorLiquidoFinal < 0) {
        // --- CENÁRIO NEGATIVO ---
        negativeContainer.classList.remove('hidden');
        positiveSelectionContainer.classList.add('hidden');
        document.getElementById('valDevedorFinal').textContent = formatarMoeda(valorLiquidoFinal);
    } else {
        // --- CENÁRIO POSITIVO ---
        negativeContainer.classList.add('hidden');
        positiveSelectionContainer.classList.remove('hidden');

        // Prepara os dados (mas não mostra ainda, espera o clique)
        prepararDadosPJ(valorLiquidoFinal);
        prepararDadosPF(valorLiquidoFinal);
    }
}

function prepararDadosPJ(valorFinal) {
    document.getElementById('valFinalPJ').textContent = formatarMoeda(valorFinal);
}

function prepararDadosPF(valorFinal) {
    const valorAbsoluto = valorFinal; 
    const descRPA = valorAbsoluto * TAXAS.rpa;
    const descISS = valorAbsoluto * TAXAS.iss;
    const finalPF = valorFinal - descRPA - descISS;

    document.getElementById('descRPA').textContent = formatarMoeda(-descRPA);
    document.getElementById('descISS').textContent = formatarMoeda(-descISS);
    document.getElementById('valFinalPF').textContent = formatarMoeda(finalPF);
}

function resetSelection() {
    // Esconde detalhes e reseta botões
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

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    const inputsMoeda = document.querySelectorAll('.money-input');
    inputsMoeda.forEach(input => {
        input.addEventListener('input', aplicarMascaraMoeda);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });

    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);

    // --- LÓGICA DE SELEÇÃO DE BOTÕES ---
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
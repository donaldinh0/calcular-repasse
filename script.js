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

    // 4. Dívida (Obrigatória na conta)
    if (saldoDevedor > 0) {
        valorAtual -= saldoDevedor;
        extratoHTML += criarLinha("(-) Abatimento Saldo Devedor", -saldoDevedor, "desconto");
    }

    // --- DECISÃO FINAL: Positivo ou Negativo? ---
    const valorLiquidoFinal = valorAtual; // Esse é o valor Base (PJ)

    // Renderiza a lista comum a todos
    document.getElementById('statementList').innerHTML = extratoHTML;

    const resultsSection = document.getElementById('resultsSection');
    const negativeContainer = document.getElementById('negativeResultContainer');
    const positiveContainer = document.getElementById('positiveResultContainer');

    // Mostra a seção principal
    resultsSection.classList.remove('hidden');

    if (valorLiquidoFinal < 0) {
        // --- CENÁRIO NEGATIVO ---
        // Mostra só o card vermelho, esconde as opções
        negativeContainer.classList.remove('hidden');
        positiveContainer.classList.add('hidden');

        document.getElementById('valDevedorFinal').textContent = formatarMoeda(valorLiquidoFinal);
        
    } else {
        // --- CENÁRIO POSITIVO ---
        // Mostra as opções PJ/PF, esconde o card vermelho
        negativeContainer.classList.add('hidden');
        positiveContainer.classList.remove('hidden');

        // Cálculo PJ (é o próprio líquido)
        document.getElementById('valFinalPJ').textContent = formatarMoeda(valorLiquidoFinal);

        // Cálculo PF (Líquido - RPA - ISS)
        const valorAbsoluto = valorLiquidoFinal; 
        const descRPA = valorAbsoluto * TAXAS.rpa;
        const descISS = valorAbsoluto * TAXAS.iss;
        const finalPF = valorLiquidoFinal - descRPA - descISS;

        document.getElementById('valFinalPF').textContent = formatarMoeda(finalPF);
    }
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

    // Tooltip Mobile Logic (agora dentro do card PF)
    const btnHelp = document.getElementById('btnHelp');
    
    if (btnHelp) {
        btnHelp.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const tooltip = btnHelp.nextElementSibling; // Pega o div .tooltip-text
            if(tooltip) tooltip.classList.toggle('show-tooltip');
        });
    }

    document.addEventListener('click', () => {
        const allTooltips = document.querySelectorAll('.tooltip-text');
        allTooltips.forEach(t => t.classList.remove('show-tooltip'));
    });
});
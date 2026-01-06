const TAXAS = {
    ir: 0.20,
    mesa: 0.10,
    rpa: 0.11,
    iss: 0.05
};

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function getInputValue(id) {
    const value = document.getElementById(id).value;
    return value ? parseFloat(value) : 0;
}

// Função principal de cálculo
function calcularResultado() {
    // 1. Pega os valores
    let valorAtual = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    
    // 2. Verifica se o botão de RPA está ligado ou desligado
    const checkRPA = document.getElementById('checkRPA');
    const usaRPA = checkRPA.checked; 
    
    // Lista para montagem do HTML
    let extratoHTML = '';

    // --- Passo 1: Resultado Mensal ---
    extratoHTML += criarLinha("Resultado Mensal", valorAtual, "bruto");

    // --- Passo 2: IR (20%) ---
    const valorIR = valorAtual * TAXAS.ir;
    valorAtual -= valorIR; 
    extratoHTML += criarLinha("(-) Imposto de Renda (20%)", -valorIR, "desconto");
    
    // Subtotal 1
    extratoHTML += criarLinha("Resultado após IR", valorAtual, "subtotal");

    // --- Passo 3: Mesa (10% sobre o restante) ---
    const valorMesa = valorAtual * TAXAS.mesa;
    valorAtual -= valorMesa; 
    extratoHTML += criarLinha("(-) Lucro da Mesa (10%)", -valorMesa, "desconto");

    // Subtotal 2 (Lucro do Trader)
    extratoHTML += criarLinha("Lucro do Trader", valorAtual, "subtotal");

    // --- Passo 4: Dívida (se houver) ---
    if (saldoDevedor > 0) {
        valorAtual -= saldoDevedor;
        extratoHTML += criarLinha("(-) Abatimento Saldo Devedor", -saldoDevedor, "desconto");
    }

    // --- Passo 5: RPA (SÓ ENTRA AQUI SE O BOTÃO ESTIVER LIGADO) ---
    if (usaRPA) {
        // Lógica Visual: Abate as taxas do valor absoluto para "reduzir" a dívida visualmente
        const valorAbsoluto = Math.abs(valorAtual);
        
        const valorRPA = valorAbsoluto * TAXAS.rpa;
        const valorISS = valorAbsoluto * TAXAS.iss;
        const totalTaxasRPA = valorRPA + valorISS;

        if (valorAtual >= 0) {
            // Se for lucro, desconta normal
            valorAtual -= totalTaxasRPA;
        } else {
            // Se for dívida, "soma" para reduzir o tamanho da dívida (ex: -7000 vai para -6000)
            valorAtual += totalTaxasRPA; 
        }
        
        extratoHTML += criarLinha("(-) Desconto RPA (11%)", -valorRPA, "desconto");
        extratoHTML += criarLinha("(-) Desconto ISS (5%)", -valorISS, "desconto");
    }

    // Renderizar na tela
    renderizar(extratoHTML, valorAtual, usaRPA);
}

// Cria o HTML da linha
function criarLinha(label, valor, tipo) {
    return `
        <li class="statement-item item-${tipo}">
            <span class="item-label">${label}</span>
            <span class="item-value">${formatarMoeda(valor)}</span>
        </li>
    `;
}

function renderizar(htmlLista, valorFinal, usaRPA) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    const valorFinalDisplay = document.getElementById('valorFinalDisplay');
    const finalCard = document.querySelector('.final-result-card');
    const rpaHint = document.getElementById('rpaHint');

    statementList.innerHTML = htmlLista;
    valorFinalDisplay.textContent = formatarMoeda(valorFinal);
    
    // Cor do card final
    if (valorFinal >= 0) {
        finalCard.className = 'final-result-card text-green';
    } else {
        finalCard.className = 'final-result-card text-red';
    }

    // Texto explicativo "Com descontos de RPA..."
    if (usaRPA) rpaHint.classList.remove('hidden');
    else rpaHint.classList.add('hidden');

    resultsSection.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // Garante que o RPA comece desligado ao atualizar a página
    const checkRPA = document.getElementById('checkRPA');
    if(checkRPA) checkRPA.checked = false;

    // Botão Calcular
    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    
    // Quando clicar no botão "Emite RPA?", recalcula na hora
    checkRPA.addEventListener('change', () => {
        // Só calcula se a área de resultados já estiver visível
        if (!document.getElementById('resultsSection').classList.contains('hidden')) {
            calcularResultado();
        }
    });

    // Enter nos inputs
    ['resultadoMensal', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });
});
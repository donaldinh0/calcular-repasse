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
    // Entradas
    let valorAtual = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    const usaRPA = document.getElementById('checkRPA').checked;
    
    // Lista para montagem do HTML
    let extratoHTML = '';

    // --- Passo 1: Resultado Mensal ---
    extratoHTML += criarLinha("Resultado Mensal", valorAtual, "bruto");

    // --- Passo 2: IR (20%) ---
    const valorIR = valorAtual * TAXAS.ir;
    valorAtual -= valorIR; // Subtrai
    extratoHTML += criarLinha("(-) Imposto de Renda (20%)", -valorIR, "desconto");
    
    // Subtotal 1
    extratoHTML += criarLinha("Resultado após IR", valorAtual, "subtotal");

    // --- Passo 3: Mesa (10% sobre o restante) ---
    const valorMesa = valorAtual * TAXAS.mesa;
    valorAtual -= valorMesa; // Subtrai
    extratoHTML += criarLinha("(-) Lucro da Mesa (10%)", -valorMesa, "desconto");

    // Subtotal 2 (Lucro do Trader)
    extratoHTML += criarLinha("Lucro do Trader", valorAtual, "subtotal");

    // --- Passo 4: Dívida (se houver) ---
    if (saldoDevedor > 0) {
        valorAtual -= saldoDevedor;
        extratoHTML += criarLinha("(-) Abatimento Saldo Devedor", -saldoDevedor, "desconto");
    }

    // --- Passo 5: RPA (Se a caixa estiver marcada) ---
    if (usaRPA) {
        // Lógica "Opção B": Desconta a taxa sobre o valor absoluto e reduz visualmente a dívida (ou lucro)
        const valorAbsoluto = Math.abs(valorAtual);
        
        const valorRPA = valorAbsoluto * TAXAS.rpa;
        const valorISS = valorAbsoluto * TAXAS.iss;
        const totalTaxasRPA = valorRPA + valorISS;

        // Se o valorAtual for positivo, subtrai as taxas (ganha menos)
        // Se o valorAtual for negativo, "soma" as taxas (reduz a magnitude da dívida visualmente conforme seu pedido)
        if (valorAtual >= 0) {
            valorAtual -= totalTaxasRPA;
        } else {
            valorAtual += totalTaxasRPA; // -7000 + 1000 = -6000
        }
        
        extratoHTML += criarLinha("(-) Desconto RPA (11%)", -valorRPA, "desconto");
        extratoHTML += criarLinha("(-) Desconto ISS (5%)", -valorISS, "desconto");
    }

    // Renderizar
    renderizar(extratoHTML, valorAtual, usaRPA);
}

// Função auxiliar para criar o HTML da linha
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
    
    // Atualiza cor do card final
    if (valorFinal >= 0) {
        finalCard.className = 'final-result-card text-green';
    } else {
        finalCard.className = 'final-result-card text-red';
    }

    // Mostra/Oculta dica de RPA
    if (usaRPA) rpaHint.classList.remove('hidden');
    else rpaHint.classList.add('hidden');

    resultsSection.classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botão Calcular
    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    
    // Switch RPA (Recalcula na hora se mudar)
    document.getElementById('checkRPA').addEventListener('change', () => {
        const sectionVisible = !document.getElementById('resultsSection').classList.contains('hidden');
        if (sectionVisible) calcularResultado();
    });

    // Enter nos inputs
    ['resultadoMensal', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });
});
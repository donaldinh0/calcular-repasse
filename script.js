const TAXAS = {
    ir: 0.20,
    mesa: 0.10,
    rpa: 0.11,
    iss: 0.05
};

// --- Formatadores ---
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para ler o valor formatado e converter para número de cálculo
function getInputValue(id) {
    const value = document.getElementById(id).value;
    if (!value) return 0;

    // Remove pontos de milhar e troca vírgula por ponto decimal
    // Ex: "30.000,00" -> "30000.00"
    const numeroLimpo = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(numeroLimpo);
}

// --- Lógica Principal (Cascata) ---
function calcularResultado() {
    let valorAtual = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    const checkRPA = document.getElementById('checkRPA');
    const usaRPA = checkRPA.checked; 
    
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

    // 5. RPA
    if (usaRPA) {
        const valorAbsoluto = Math.abs(valorAtual);
        const valorRPA = valorAbsoluto * TAXAS.rpa;
        const valorISS = valorAbsoluto * TAXAS.iss;
        const totalTaxasRPA = valorRPA + valorISS;

        if (valorAtual >= 0) {
            valorAtual -= totalTaxasRPA;
        } else {
            valorAtual += totalTaxasRPA; 
        }
        
        extratoHTML += criarLinha("(-) Desconto RPA (11%)", -valorRPA, "desconto");
        extratoHTML += criarLinha("(-) Desconto ISS (5%)", -valorISS, "desconto");
    }

    renderizar(extratoHTML, valorAtual, usaRPA);
}

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
    const finalAmountEl = document.getElementById('finalAmount');
    const finalResultCard = document.querySelector('.final-result');
    const debtAlert = document.getElementById('debtAlert');

    statementList.innerHTML = '';

    extrato.forEach(item => {
        const li = document.createElement('li');
        li.className = `statement-item is-${item.tipo}`;
        li.innerHTML = `
            <span class="item-label">${item.label}</span>
            <span class="item-value">${formatarMoeda(item.valor)}</span>
        `;
        statementList.appendChild(li);
    });

    finalAmountEl.textContent = formatarMoeda(valorFinal);
    resultsSection.classList.remove('hidden');

    if (valorFinal < 0) {
        finalResultCard.classList.add('negative-balance');
        debtAlert.classList.remove('hidden');
        document.querySelector('.result-label').textContent = "Saldo Devedor Final:";
    } else {
        rpaHint.textContent = "(Sem descontos de RPA e ISS aplicados)";
    }

    resultsSection.classList.remove('hidden');
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    ['lucroLiquido', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });
});
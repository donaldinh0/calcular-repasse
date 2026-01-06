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
    const valorFinalDisplay = document.getElementById('valorFinalDisplay');
    const finalCard = document.querySelector('.final-result-card');
    const labelResultado = document.getElementById('labelResultado');
    const rpaHint = document.getElementById('rpaHint');

    statementList.innerHTML = htmlLista;
    valorFinalDisplay.textContent = formatarMoeda(valorFinal);
    
    if (valorFinal >= 0) {
        finalCard.className = 'final-result-card text-green';
        labelResultado.textContent = "Valor a Receber";
    } else {
        finalCard.className = 'final-result-card text-red';
        labelResultado.textContent = "Valor Líquido Total:";
    }

    rpaHint.classList.remove('hidden'); 
    if (usaRPA) {
        rpaHint.textContent = "(Com descontos de RPA e ISS aplicados)";
    } else {
        rpaHint.textContent = "(Sem descontos de RPA e ISS aplicados)";
    }

    resultsSection.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const checkRPA = document.getElementById('checkRPA');
    if(checkRPA) checkRPA.checked = false;

    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    
    checkRPA.addEventListener('change', () => {
        if (!document.getElementById('resultsSection').classList.contains('hidden')) {
            calcularResultado();
        }
    });

    ['resultadoMensal', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });

    // --- NOVA LÓGICA DO BOTÃO DE AJUDA ---
    // Permite clicar no "?" para abrir o balão no celular
    const btnHelp = document.getElementById('btnHelp');
    const tooltipText = document.querySelector('.tooltip-text');

    btnHelp.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que o clique feche imediatamente
        tooltipText.classList.toggle('show-tooltip');
    });

    // Fecha o balão se clicar em qualquer outro lugar da tela
    document.addEventListener('click', () => {
        tooltipText.classList.remove('show-tooltip');
    });
});
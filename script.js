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
    
    // 2. Verifica RPA
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

    // --- Passo 5: RPA (Lógica Condicional) ---
    if (usaRPA) {
        const valorAbsoluto = Math.abs(valorAtual);
        
        const valorRPA = valorAbsoluto * TAXAS.rpa;
        const valorISS = valorAbsoluto * TAXAS.iss;
        const totalTaxasRPA = valorRPA + valorISS;

        if (valorAtual >= 0) {
            valorAtual -= totalTaxasRPA;
        } else {
            // Lógica visual para diminuir a dívida
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
    
    // Elementos de texto dinâmico
    const labelResultado = document.getElementById('labelResultado');
    const rpaHint = document.getElementById('rpaHint');

    statementList.innerHTML = htmlLista;
    valorFinalDisplay.textContent = formatarMoeda(valorFinal);
    
    // 1. Define a cor do card e o Título (Devedor vs A Receber)
    if (valorFinal >= 0) {
        finalCard.className = 'final-result-card text-green';
        labelResultado.textContent = "Valor a Receber";
    } else {
        finalCard.className = 'final-result-card text-red';
        labelResultado.textContent = "Seu saldo devedor atual é de:";
    }

    // 2. Define a mensagem sobre RPA
    // Removemos o 'hidden' pois agora sempre queremos mostrar uma das duas mensagens
    rpaHint.classList.remove('hidden'); 

    if (usaRPA) {
        rpaHint.textContent = "(Com descontos de RPA e ISS aplicados)";
    } else {
        rpaHint.textContent = "(Sem descontos de RPA e ISS aplicados)";
    }

    resultsSection.classList.remove('hidden');
}

// Event Listeners
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
});
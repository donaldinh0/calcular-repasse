// --- Taxas Configuráveis ---
const TAXAS = {
    PJ: { ir: 0.20, mesa: 0.10 },
    PF: { ir: 0.20, mesa: 0.10, rpa: 0.11, iss: 0.05 }
};

// --- Formatadores ---
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function getInputValue(id) {
    const value = document.getElementById(id).value;
    return value ? parseFloat(value) : 0;
}

// --- Lógica Principal (Cascata) ---
function calcularResultado() {
    // 1. Entradas
    let baseCalculo = getInputValue('lucroLiquido'); // Começa com o Lucro Líquido inserido
    const saldoDevedor = getInputValue('saldoDevedor');
    const tipoContrato = document.querySelector('input[name="contract-type"]:checked').value;
    
    // Variáveis de controle
    const taxasAtuais = TAXAS[tipoContrato];
    let detalhesExtrato = [];
    
    // Adiciona linha inicial
    detalhesExtrato.push({ label: "Entrada (Lucro Líquido)", valor: baseCalculo, tipo: "bruto" });

    // --- PASSO 1: Imposto de Renda (20% sobre a entrada) ---
    // Nota: O cálculo é sobre o valor cheio, mas subtraído do montante.
    const valorIR = baseCalculo * taxasAtuais.ir;
    baseCalculo -= valorIR; // Atualiza o saldo
    detalhesExtrato.push({ 
        label: `(-) Imposto de Renda (20%)`, 
        valor: -valorIR, 
        tipo: "desconto" 
    });

    // --- PASSO 2: Lucro da Mesa (10% sobre o que sobrou do IR) ---
    const valorMesa = baseCalculo * taxasAtuais.mesa;
    baseCalculo -= valorMesa; // Atualiza o saldo
    detalhesExtrato.push({ 
        label: `(-) Lucro da Mesa (10% do restante)`, 
        valor: -valorMesa, 
        tipo: "desconto" 
    });

    // Subtotal para visualização (Lucro do Trader antes da dívida)
    // Se quiser mostrar essa linha, descomente abaixo:
    // detalhesExtrato.push({ label: "Subtotal (Trader)", valor: baseCalculo, tipo: "neutro" });

    // --- PASSO 3: Saldo Devedor ---
    if (saldoDevedor > 0) {
        baseCalculo -= saldoDevedor;
        detalhesExtrato.push({ 
            label: "(-) Abatimento Saldo Devedor", 
            valor: -saldoDevedor, 
            tipo: "desconto" 
        });
    }

    // --- PASSO 4: Taxas PF (RPA e ISS) sobre o SALDO FINAL ---
    // A lógica aqui segue sua ordem: desconta sobre o valor que sobrou (mesmo se for negativo)
    if (tipoContrato === 'PF') {
        // Usamos Math.abs() para calcular a taxa sobre o tamanho do valor, 
        // mas subtraímos para descontar.
        const baseParaTaxas = Math.abs(baseCalculo); 

        const valorRPA = baseParaTaxas * taxasAtuais.rpa;
        baseCalculo -= valorRPA;
        detalhesExtrato.push({ 
            label: `(-) RPA (11% do saldo)`, 
            valor: -valorRPA, 
            tipo: "desconto" 
        });

        const valorISS = baseParaTaxas * taxasAtuais.iss;
        baseCalculo -= valorISS;
        detalhesExtrato.push({ 
            label: `(-) ISS (5% do saldo)`, 
            valor: -valorISS, 
            tipo: "desconto" 
        });
    }

    // 5. Renderizar
    renderizarResultados(detalhesExtrato, baseCalculo);
}

// --- Interface ---
function renderizarResultados(extrato, valorFinal) {
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
        finalResultCard.classList.remove('negative-balance');
        debtAlert.classList.add('hidden');
        document.querySelector('.result-label').textContent = "Valor Líquido a Receber:";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    ['lucroLiquido', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });
});
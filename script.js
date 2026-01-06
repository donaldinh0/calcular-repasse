// --- Taxas Configuráveis ---
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

function getInputValue(id) {
    const value = document.getElementById(id).value;
    return value ? parseFloat(value) : 0;
}

// --- Lógica Principal ---
function calcularResultado() {
    // 1. Entradas
    let resultadoMensal = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    
    // Lista para o extrato visual
    let detalhesExtrato = [];
    
    // --- PASSO 1: Cálculo até o "Valor Líquido Total" ---
    // Início
    detalhesExtrato.push({ label: "Resultado Mensal", valor: resultadoMensal, tipo: "bruto" });

    // 20% IR
    const valorIR = resultadoMensal * TAXAS.ir;
    let baseAposIR = resultadoMensal - valorIR;
    detalhesExtrato.push({ label: `(-) Imposto de Renda (20%)`, valor: -valorIR, tipo: "desconto" });

    // 10% Mesa (sobre o restante após IR)
    const valorMesa = baseAposIR * TAXAS.mesa;
    let valorLiquidoTotal = baseAposIR - valorMesa;
    detalhesExtrato.push({ label: `(-) Lucro da Mesa (10%)`, valor: -valorMesa, tipo: "desconto" });


    // --- PASSO 2: Aplicação do Saldo Devedor ---
    // O saldo devedor é aplicado sobre o Valor Líquido Total
    let saldoAposDivida = valorLiquidoTotal - saldoDevedor;

    // Se houver dívida, mostramos no extrato apenas para visualização, 
    // mas o cálculo final será separado nos boxes.
    if (saldoDevedor > 0) {
         detalhesExtrato.push({ label: "(-) Saldo Devedor", valor: -saldoDevedor, tipo: "desconto" });
    }

    // --- PASSO 3: Cálculo do cenário RPA ---
    // RPA e ISS incidem sobre o valor que sobrou (ou aumentam a dívida)
    // Usamos o módulo (abs) para calcular a taxa sobre o montante, independente se é dívida ou lucro.
    const baseParaTaxas = Math.abs(saldoAposDivida);
    
    const descontoRPA = baseParaTaxas * TAXAS.rpa;
    const descontoISS = baseParaTaxas * TAXAS.iss;
    
    const resultadoFinalRPA = saldoAposDivida - descontoRPA - descontoISS;

    // --- Renderização ---
    renderizarResultados(detalhesExtrato, valorLiquidoTotal, saldoAposDivida, resultadoFinalRPA);
}

function renderizarResultados(extrato, valLiquidoTotal, finalPJ, finalRPA) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    
    // Elementos de Valor
    const elValLiqTotal = document.getElementById('valLiqTotal');
    const elFinalPJ = document.getElementById('finalPJ');
    const elFinalRPA = document.getElementById('finalRPA');

    // Limpa lista
    statementList.innerHTML = '';

    // Gera lista do extrato
    extrato.forEach(item => {
        const li = document.createElement('li');
        li.className = `statement-item is-${item.tipo}`;
        li.innerHTML = `
            <span class="item-label">${item.label}</span>
            <span class="item-value">${formatarMoeda(item.valor)}</span>
        `;
        statementList.appendChild(li);
    });

    // Atualiza Valores
    elValLiqTotal.textContent = formatarMoeda(valLiquidoTotal);
    
    elFinalPJ.textContent = formatarMoeda(finalPJ);
    if(finalPJ < 0) elFinalPJ.classList.add('is-negative');
    else elFinalPJ.classList.remove('is-negative');

    elFinalRPA.textContent = formatarMoeda(finalRPA);
    if(finalRPA < 0) elFinalRPA.classList.add('is-negative');
    else elFinalRPA.classList.remove('is-negative');

    // Mostra resultado
    resultsSection.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnCalcular').addEventListener('click', calcularResultado);
    ['resultadoMensal', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultado();
        });
    });
});
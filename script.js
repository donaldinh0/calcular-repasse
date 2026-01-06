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
    // 1. Entradas
    let resultadoMensal = getInputValue('resultadoMensal'); 
    const saldoDevedor = getInputValue('saldoDevedor');
    
    let detalhesExtrato = [];
    
    // --- PARTE A: Calcular "Lucro do Trader" (Pré-dívida) ---
    // Mensal - IR - Mesa
    detalhesExtrato.push({ label: "Resultado Mensal", valor: resultadoMensal, tipo: "bruto" });

    // IR (20%)
    const valorIR = resultadoMensal * TAXAS.ir;
    let baseAposIR = resultadoMensal - valorIR;
    detalhesExtrato.push({ label: `(-) Imposto de Renda (20%)`, valor: -valorIR, tipo: "desconto" });

    // Mesa (10% cascata)
    const valorMesa = baseAposIR * TAXAS.mesa;
    let lucroTrader = baseAposIR - valorMesa; // Esse é o "Lucro do Trader"
    detalhesExtrato.push({ label: `(-) Lucro da Mesa (10%)`, valor: -valorMesa, tipo: "desconto" });

    // --- PARTE B: Calcular "Valor Líquido Total" ---
    // Lucro do Trader - Saldo Devedor
    let valorLiquidoTotal = lucroTrader - saldoDevedor;

    // --- PARTE C: Calcular RPA ---
    // Regra nova: (Valor Líquido Total) - 11% - 5%
    // Math.abs garante que descontamos o valor da taxa mesmo se o saldo for negativo
    const baseCalculoRPA = Math.abs(valorLiquidoTotal);
    
    const contaA = baseCalculoRPA * TAXAS.rpa; // 11%
    const contaB = baseCalculoRPA * TAXAS.iss; // 5%
    
    const valorPagoTrader = valorLiquidoTotal - contaA - contaB;

    renderizarResultados(detalhesExtrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader);
}

function renderizarResultados(extrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    const debtList = document.getElementById('debtList');
    
    // Elementos de Valor
    const elLucroTrader = document.getElementById('lucroTrader');
    const elValLiqTotal = document.getElementById('valLiqTotal');
    const elFinalRPA = document.getElementById('finalRPA');

    // 1. Lista de descontos iniciais
    statementList.innerHTML = '';
    extrato.forEach(item => {
        const li = document.createElement('li');
        li.className = `statement-item is-${item.tipo}`;
        li.innerHTML = `<span class="item-label">${item.label}</span><span class="item-value">${formatarMoeda(item.valor)}</span>`;
        statementList.appendChild(li);
    });

    // 2. Box Intermediário (Lucro Trader)
    elLucroTrader.textContent = formatarMoeda(lucroTrader);
    elLucroTrader.className = lucroTrader >= 0 ? 'text-green' : 'text-red';

    // 3. Lista de Dívida (Apenas se tiver dívida)
    debtList.innerHTML = '';
    if (saldoDevedor > 0) {
        debtList.classList.remove('hidden');
        const li = document.createElement('li');
        li.className = `statement-item is-discount`;
        li.innerHTML = `<span class="item-label">(-) Abatimento Saldo Devedor</span><span class="item-value">${formatarMoeda(-saldoDevedor)}</span>`;
        debtList.appendChild(li);
    } else {
        debtList.classList.add('hidden');
    }

    // 4. Box Valor Líquido Total
    elValLiqTotal.textContent = formatarMoeda(valorLiquidoTotal);
    if(valorLiquidoTotal < 0) elValLiqTotal.classList.add('is-negative-result');
    else elValLiqTotal.classList.remove('is-negative-result');

    // 5. Box RPA
    elFinalRPA.textContent = formatarMoeda(valorPagoTrader);
    if(valorPagoTrader < 0) elFinalRPA.classList.add('is-negative-result');
    else elFinalRPA.classList.remove('is-negative-result');
    
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
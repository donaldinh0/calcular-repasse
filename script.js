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
    detalhesExtrato.push({ label: "Resultado Mensal", valor: resultadoMensal, tipo: "bruto" });

    // IR (20%)
    const valorIR = resultadoMensal * TAXAS.ir;
    let baseAposIR = resultadoMensal - valorIR;
    detalhesExtrato.push({ label: `(-) Imposto de Renda (20%)`, valor: -valorIR, tipo: "desconto" });

    // Mesa (10% cascata)
    const valorMesa = baseAposIR * TAXAS.mesa;
    let lucroTrader = baseAposIR - valorMesa; // Lucro do Trader
    detalhesExtrato.push({ label: `(-) Lucro da Mesa (10%)`, valor: -valorMesa, tipo: "desconto" });

    // --- PARTE B: Calcular "Valor Líquido Total" ---
    let valorLiquidoTotal = lucroTrader - saldoDevedor;

    // --- PARTE C: Calcular RPA (Lógica Opção B) ---
    // A pedido: Calculamos os impostos sobre o valor absoluto e SUBTRAÍMOS do montante,
    // mantendo o sinal original.
    
    const valorAbsoluto = Math.abs(valorLiquidoTotal); // Ex: Transforma -7272 em 7272
    
    const contaA = valorAbsoluto * TAXAS.rpa; // 11%
    const contaB = valorAbsoluto * TAXAS.iss; // 5%
    
    // A conta que você pediu: (Valor Líquido - A - B)
    // Se era negativo, continua negativo, mas com magnitude menor (-6109).
    const valorBasePositivo = valorAbsoluto - contaA - contaB;
    
    // Aplica o sinal original (se era dívida, continua dívida)
    const sinal = valorLiquidoTotal < 0 ? -1 : 1;
    const valorPagoTrader = valorBasePositivo * sinal;

    renderizarResultados(detalhesExtrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader);
}

function renderizarResultados(extrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    const debtList = document.getElementById('debtList');
    
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

    // 2. Lucro Trader
    elLucroTrader.textContent = formatarMoeda(lucroTrader);
    elLucroTrader.className = lucroTrader >= 0 ? 'text-green' : 'text-red';

    // 3. Dívida
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

    // 4. Valor Líquido Total
    elValLiqTotal.textContent = formatarMoeda(valorLiquidoTotal);
    if(valorLiquidoTotal < 0) elValLiqTotal.classList.add('is-negative-result');
    else elValLiqTotal.classList.remove('is-negative-result');

    // 5. RPA
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
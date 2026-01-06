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

    // IR
    const valorIR = resultadoMensal * TAXAS.ir;
    let baseAposIR = resultadoMensal - valorIR;
    detalhesExtrato.push({ label: `(-) Imposto de Renda (20%)`, valor: -valorIR, tipo: "desconto" });

    // Mesa
    const valorMesa = baseAposIR * TAXAS.mesa;
    let lucroTrader = baseAposIR - valorMesa; // Esse é o "Lucro do Trader"
    detalhesExtrato.push({ label: `(-) Lucro da Mesa (10%)`, valor: -valorMesa, tipo: "desconto" });

    // --- PARTE B: Calcular "Valor Líquido Total" ---
    // Lucro do Trader - Saldo Devedor
    let valorLiquidoTotal = lucroTrader - saldoDevedor;

    // --- PARTE C: Calcular RPA ---
    // Baseado no Valor Líquido Total
    // Obs: Usamos Math.abs() para calcular o valor do imposto (custo) sobre o montante,
    // garantindo que ele seja subtraído corretamente.
    const baseCalculoRPA = Math.abs(valorLiquidoTotal);
    
    const contaA = baseCalculoRPA * TAXAS.rpa; // 11%
    const contaB = baseCalculoRPA * TAXAS.iss; // 5%
    
    const valorPagoTrader = valorLiquidoTotal - contaA - contaB;

    renderizarResultados(detalhesExtrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader);
}

function renderizarResultados(extrato, lucroTrader, saldoDevedor, valorLiquidoTotal, valorPagoTrader) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    
    // Elementos
    const elLucroTrader = document.getElementById('lucroTrader');
    const elValLiqTotal = document.getElementById('valLiqTotal');
    const elFinalRPA = document.getElementById('finalRPA');
    const divDivida = document.getElementById('dividaLine');
    const elValDivida = document.getElementById('valDivida');

    // 1. Lista de descontos iniciais
    statementList.innerHTML = '';
    extrato.forEach(item => {
        const li = document.createElement('li');
        li.className = `statement-item is-${item.tipo}`;
        li.innerHTML = `<span class="item-label">${item.label}</span><span class="item-value">${formatarMoeda(item.valor)}</span>`;
        statementList.appendChild(li);
    });

    // 2. Lucro do Trader (Verde/Vermelho)
    elLucroTrader.textContent = formatarMoeda(lucroTrader);
    elLucroTrader.className = lucroTrader >= 0 ? 'text-green' : 'text-red';

    // 3. Linha do Saldo Devedor
    if (saldoDevedor > 0) {
        divDivida.classList.remove('hidden');
        elValDivida.textContent = formatarMoeda(-saldoDevedor);
    } else {
        divDivida.classList.add('hidden');
    }

    // 4. Valor Líquido Total (Principal)
    elValLiqTotal.textContent = formatarMoeda(valorLiquidoTotal);
    // Se quiser colorir o principal também:
    if(valorLiquidoTotal < 0) elValLiqTotal.style.color = 'var(--danger-color)';
    else elValLiqTotal.style.color = 'var(--text-main)';

    // 5. Box RPA
    elFinalRPA.textContent = formatarMoeda(valorPagoTrader);
    
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
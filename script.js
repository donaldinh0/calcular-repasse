// --- Configurações e Taxas ---
const TAXAS = {
    PJ: {
        ir: 0.20,
        mesa: 0.10
    },
    PF: {
        ir: 0.20,
        mesa: 0.10,
        rpa: 0.11,
        iss: 0.05
    }
};

// --- Funções Utilitárias ---

/**
 * Formata um número para o padrão monetário brasileiro (R$).
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Lê e limpa os valores dos inputs numéricos.
 */
function getInputValue(id) {
    const value = document.getElementById(id).value;
    // Se estiver vazio ou não for número, retorna 0, senão converte para float
    return value ? parseFloat(value) : 0;
}

// --- Lógica de Cálculo ---
function calcularResultado() {
    // 1. Obter dados da interface
    const lucroBruto = getInputValue('lucroBruto');
    const saldoDevedor = getInputValue('saldoDevedor');
    // Pega qual radio button está marcado (PJ ou PF)
    const tipoContrato = document.querySelector('input[name="contract-type"]:checked').value;

    // Validação básica
    if (lucroBruto <= 0) {
        alert("Por favor, insira um Lucro Bruto válido.");
        return;
    }

    const taxasAtuais = TAXAS[tipoContrato];
    let detalhesExtrato = [];
    let totalDescontos = 0;

    // 2. Adiciona o Lucro Bruto ao extrato
    detalhesExtrato.push({
        label: "Lucro Bruto",
        valor: lucroBruto,
        tipo: "bruto"
    });

    // 3. Cálculos das taxas (baseadas no Bruto)
    // A ordem aqui segue o seu pedido: IR, Mesa, Devedor, RPA, ISS

    // IR
    const valorIR = lucroBruto * taxasAtuais.ir;
    detalhesExtrato.push({ label: `Imposto de Renda (${taxasAtuais.ir * 100}%)`, valor: -valorIR, tipo: "desconto" });
    totalDescontos += valorIR;

    // Mesa
    const valorMesa = lucroBruto * taxasAtuais.mesa;
    detalhesExtrato.push({ label: `Lucro da Mesa (${taxasAtuais.mesa * 100}%)`, valor: -valorMesa, tipo: "desconto" });
    totalDescontos += valorMesa;

    // Saldo Devedor
    if (saldoDevedor > 0) {
        detalhesExtrato.push({ label: "Abatimento Saldo Devedor", valor: -saldoDevedor, tipo: "desconto" });
        totalDescontos += saldoDevedor;
    }

    // Taxas específicas de PF
    if (tipoContrato === 'PF') {
        const valorRPA = lucroBruto * taxasAtuais.rpa;
        detalhesExtrato.push({ label: `RPA (${taxasAtuais.rpa * 100}%)`, valor: -valorRPA, tipo: "desconto" });
        totalDescontos += valorRPA;

        const valorISS = lucroBruto * taxasAtuais.iss;
        detalhesExtrato.push({ label: `ISS (${taxasAtuais.iss * 100}%)`, valor: -valorISS, tipo: "desconto" });
        totalDescontos += valorISS;
    }

    // 4. Cálculo Final
    const valorLiquido = lucroBruto - totalDescontos;

    // 5. Atualizar a Interface
    renderizarResultados(detalhesExtrato, valorLiquido);
}

// --- Manipulação do DOM (Interface) ---
function renderizarResultados(extrato, valorLiquidoFinal) {
    const resultsSection = document.getElementById('resultsSection');
    const statementList = document.getElementById('statementList');
    const finalAmountEl = document.getElementById('finalAmount');
    const finalResultCard = document.querySelector('.final-result');
    const debtAlert = document.getElementById('debtAlert');

    // Limpa lista anterior
    statementList.innerHTML = '';

    // Gera o HTML de cada linha do extrato
    extrato.forEach(item => {
        const li = document.createElement('li');
        // Adiciona classes CSS dependendo se é valor bruto ou desconto
        li.className = `statement-item is-${item.tipo}`;
        
        li.innerHTML = `
            <span class="item-label">${item.label}</span>
            <span class="item-value">${formatarMoeda(item.valor)}</span>
        `;
        statementList.appendChild(li);
    });

    // Atualiza o valor final grande
    finalAmountEl.textContent = formatarMoeda(valorLiquidoFinal);

    // Mostra a área de resultados com animação simples (removendo 'hidden')
    resultsSection.classList.remove('hidden');

    // Lógica visual para saldo negativo
    if (valorLiquidoFinal < 0) {
        finalResultCard.classList.add('negative-balance');
        debtAlert.classList.remove('hidden');
        document.querySelector('.result-label').textContent = "Saldo Devedor Remanescente:";
    } else {
        finalResultCard.classList.remove('negative-balance');
        debtAlert.classList.add('hidden');
        document.querySelector('.result-label').textContent = "Valor Líquido a Receber:";
    }
}

// --- Event Listeners ---
// Espera o HTML carregar para conectar o botão
document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btnCalcular');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', calcularResultado);
    }

    // Opcional: Permitir calcular apertando "Enter" nos inputs
    ['lucroBruto', 'saldoDevedor'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                calcularResultado();
            }
        });
    });
});
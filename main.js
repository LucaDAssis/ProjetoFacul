'use strict'

const openModal = () => document.getElementById('modal')
    .classList.add('active')

const closeModal = () => {
    clearFields()
    document.getElementById('modal').classList.remove('active')
}

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_tool_rental')) ?? []
const setLocalStorage = (dbToolRental) => localStorage.setItem("db_tool_rental", JSON.stringify(dbToolRental))

const deleteRental = (index) => {
    const dbToolRental = readRental()
    dbToolRental.splice(index, 1)
    setLocalStorage(dbToolRental)
}

const updateRental = (index, rental) => {
    const dbToolRental = readRental()
    dbToolRental[index] = rental
    setLocalStorage(dbToolRental)
}

const readRental = () => getLocalStorage()

const createRental = (rental) => {
    const dbToolRental = getLocalStorage()
    dbToolRental.push(rental)
    setLocalStorage(dbToolRental)
}

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const clearFields = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
    document.querySelector(".modal-header>h2").textContent = 'Novo Aluguel'
    document.getElementById('ferramentaAlugada').value = "";
    document.getElementById('dataAluguel').value = "";
    document.getElementById('dataDevolucaoPrevista').value = "";
    document.getElementById('comentarios').value = "";
}

// Mapa de preços das ferramentas
const toolPrices = {
    'Pá': 15.00,
    'Carrinho de Mão': 20.00,
    'Martelete': 80.00,
    'Betoneira': 120.00,
    'Furadeira': 30.00,
    'Serra Elétrica': 45.00,
    'Andaime': 25.00, // Preço por mês, conforme sua lista original
    'Nível a Laser': 70.00
};

// Função para calcular o preço total
const calculateTotalPrice = (toolName, rentalDate, returnDate) => {
    const pricePerUnit = toolPrices[toolName];
    if (!pricePerUnit) return 'N/A'; // Ferramenta não encontrada no mapa de preços

    const start = new Date(rentalDate + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    const end = new Date(returnDate + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return 'Data Inválida';
    }

    // Calcula a diferença em dias
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Para o andaime, o cálculo é por mês. Se for por mês, pode-se ajustar a lógica.
    // Por simplicidade, vamos considerar dias para todas e o andaime teria um valor alto por dia para simular o mês.
    // Ou, se a ideia é alugar andaime por mês, a lógica pode ser mais complexa (ex: alugou por 10 dias, cobra 1 mês).
    // Para este exemplo, vamos considerar que o preço do andaime (R$ 25,00) é para o período mínimo e pode ser multiplicado por "meses"
    // Aqui vou manter a lógica simples de dias para todos, se Andaime é mensal, o valor de 25/mês deve ser ajustado para diário (25/30)
    // Ou, se o aluguel do andaime for por mês, e o período for menor que 30 dias, ainda cobra-se o valor de um mês.
    // Vou usar a lógica de dias, e se for andaime, ele se comporta diferente ou seu valor diário já está adequado.

    // Ajuste para Andaime: se o período for menor ou igual a 30 dias, cobra 1 mês de R$ 25,00.
    // Se for maior que 30 dias, multiplica o número de meses pelo valor. Simplificando para cálculo diário para agora.
    if (toolName === 'Andaime') {
        // Exemplo simples: cada 30 dias completos ou fração inicial é 1 mês
        const daysInMonth = 30; // Considerando 30 dias para um mês para cálculo
        const totalMonths = Math.ceil(diffDays / daysInMonth);
        return (totalMonths * pricePerUnit).toFixed(2);
    } else {
        // Para outras ferramentas, preço por dia
        // Se a diferença for 0 dias (mesmo dia de aluguel e devolução), considerar 1 dia de aluguel.
        if (diffDays === 0 && start.toDateString() === end.toDateString()) {
             diffDays = 1;
        } else if (diffDays === 0 && start.toDateString() !== end.toDateString()) {
            // Este caso não deveria acontecer se a data final é sempre maior ou igual à inicial
            // mas para garantir que pelo menos 1 dia seja cobrado se as datas são válidas mas a diff é 0
            diffDays = 1;
        }

        return (diffDays * pricePerUnit).toFixed(2);
    }
};


const saveRental = () => {
    if (isValidFields()) {
        const toolName = document.getElementById('ferramentaAlugada').value;
        const rentalDate = document.getElementById('dataAluguel').value;
        const returnDate = document.getElementById('dataDevolucaoPrevista').value;

        const totalPrice = calculateTotalPrice(toolName, rentalDate, returnDate);

        const rental = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            cidade: document.getElementById('cidade').value,
            ferramentaAlugada: toolName,
            dataAluguel: rentalDate,
            dataDevolucaoPrevista: returnDate,
            comentarios: document.getElementById('comentarios').value,
            precoTotal: totalPrice // Armazena o preço total calculado
        }
        const index = document.getElementById('nome').dataset.index
        if (index == 'new') {
            createRental(rental)
            updateTable()
            closeModal()
        } else {
            updateRental(index, rental)
            updateTable()
            closeModal()
        }
    }
}

const createRow = (rental, index) => {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td data-label="Nome Cliente">${rental.nome}</td>
        <td data-label="Celular">${rental.celular}</td>
        <td data-label="Ferramenta Alugada">${rental.ferramentaAlugada}</td>
        <td data-label="Data Aluguel">${rental.dataAluguel}</td>
        <td data-label="Devolução Prevista">${rental.dataDevolucaoPrevista}</td>
        <td data-label="Comentários">${rental.comentarios || ''}</td>
        <td data-label="Preço Total">R$ ${rental.precoTotal || '0,00'}</td>
        <td data-label="Ação">
            <button type="button" class="button green" id="edit-${index}">Editar</button>
            <button type="button" class="button red" id="delete-${index}" >Excluir</button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

const clearTable = () => {
    const rows = document.querySelectorAll('#tableClient>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const updateTable = () => {
    const dbToolRental = readRental()
    clearTable()
    dbToolRental.forEach(createRow)
}

const fillFields = (rental) => {
    document.getElementById('nome').value = rental.nome
    document.getElementById('email').value = rental.email
    document.getElementById('celular').value = rental.celular
    document.getElementById('cidade').value = rental.cidade
    document.getElementById('ferramentaAlugada').value = rental.ferramentaAlugada || "";
    document.getElementById('dataAluguel').value = rental.dataAluguel || "";
    document.getElementById('dataDevolucaoPrevista').value = rental.dataDevolucaoPrevista || "";
    document.getElementById('comentarios').value = rental.comentarios || "";
    // Não precisamos preencher o campo de preço total no modal, ele é calculado
    document.getElementById('nome').dataset.index = rental.index
}

const editRental = (index) => {
    const rental = readRental()[index]
    rental.index = index
    fillFields(rental)
    document.querySelector(".modal-header>h2").textContent = `Editando Aluguel de ${rental.nome}`
    openModal()
}

const editDelete = (event) => {
    if (event.target.type == 'button') {
        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editRental(index)
        } else {
            const rental = readRental()[index]
            const shouldDelete = window.confirm(`Deseja realmente excluir o aluguel de ${rental.ferramentaAlugada} para ${rental.nome}?`);
            if (shouldDelete) {
                deleteRental(index)
                updateTable()
            }
        }
    }
}

const toggleView = (view) => {
    const heroSection = document.querySelector('.hero');
    const crudContainer = document.getElementById('crudContainer');

    if (view === 'home') {
        heroSection.style.display = 'flex';
        crudContainer.style.display = 'none';
    } else if (view === 'crud') {
        heroSection.style.display = 'none';
        crudContainer.style.display = 'block';
        updateTable();
    }
}

updateTable()

document.getElementById('cadastrarCliente')
    .addEventListener('click', openModal)

document.getElementById('modalClose')
    .addEventListener('click', closeModal)

document.getElementById('salvar')
    .addEventListener('click', saveRental)

document.querySelector('#tableClient>tbody')
    .addEventListener('click', editDelete)

document.getElementById('cancelar')
    .addEventListener('click', closeModal)

document.getElementById('irParaCadastro')
    .addEventListener('click', () => toggleView('crud'));

document.getElementById('voltarHome')
    .addEventListener('click', () => toggleView('home'));

document.addEventListener('DOMContentLoaded', () => {
    toggleView('home');
});
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
    dbToolRental.push (rental)
    setLocalStorage(dbToolRental)
}

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const clearFields = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
    document.querySelector(".modal-header>h2").textContent  = 'Novo Aluguel'
    document.getElementById('ferramentaAlugada').value = ""; 
    document.getElementById('dataAluguel').value = "";
    document.getElementById('dataDevolucaoPrevista').value = "";
    document.getElementById('comentarios').value = ""; 
}

const saveRental = () => {
    if (isValidFields()) {
        const rental = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            cidade: document.getElementById('cidade').value,
            ferramentaAlugada: document.getElementById('ferramentaAlugada').value,
            dataAluguel: document.getElementById('dataAluguel').value,
            dataDevolucaoPrevista: document.getElementById('dataDevolucaoPrevista').value,
            comentarios: document.getElementById('comentarios').value 
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
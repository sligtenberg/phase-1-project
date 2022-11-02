document.addEventListener('DOMContentLoaded', () => {
    populateSnacks();
    eventListeners();
})

// this function will populate the snacks from the server
const populateSnacks = () => {
    fetch('http://localhost:3000/snacks')
    .then(response => response.json())
    .then(snackCollObj => {
        console.log(snackCollObj)
        let table = document.getElementById('snack-display')
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                if (snackCollObj[i * table.rows[0].cells.length + j] === undefined) break
                else {
                    console.log(i * table.rows[0].cells.length + j)
                    console.log(table.rows[i].cells[j])
                    table.rows[i].cells[j].textContent = snackCollObj[i * table.rows[0].cells.length + j].name    
                }
            }
        }
    })
}

// this object represents money that has been inserted into the machine
const tenderedMoney = {
    fivers: {quantity: 0, value: 5},
    bucks: {quantity: 0, value: 1},
    quarters: {quantity: 0, value: 0.25},
    dimes: {quantity: 0, value: 0.1},
    nickels: {quantity: 0, value: 0.05},
}

const eventListeners = () => {
    // insert money buttons
    for (let button of document.getElementById('add-money').children) {
        button.addEventListener('click', () => {
            handleMoneyInstertion(button.value)
            updateAmtTenderedElement()
        })
    }

    // return money button
    document.getElementById('amt-tendered').children[1].addEventListener('click', () => {
        handleReturn()
        updateAmtTenderedElement()
    })
}

// this function adds money to the tenderedMoney object
const handleMoneyInstertion = (denomination) => tenderedMoney[denomination].quantity++

// this function returns the total value of the tenderedMoney
const totalTendered = () => Object.values(tenderedMoney).reduce((total, denomination) => total + denomination.quantity * denomination.value, 0)

// this function resets the tenderedMoney quantities to zero for all denominations
const handleReturn = () => Object.values(tenderedMoney).map(denomination => denomination.quantity = 0)

// this function updates the amount tendered HTML element
const updateAmtTenderedElement = () => document.getElementById('amt-tendered').children[0].textContent = `$${totalTendered().toFixed(2)}`
document.addEventListener('DOMContentLoaded', () => {
    populateSnacks();

    // listen for insert money buttons event
    for (let button of document.getElementById('add-money').children) {
        button.addEventListener('click', () => {
            handleMoneyInstertion(button.value)
            updateAmtTenderedElement()
        })
    }

    // listen for return money button event
    document.getElementById('amt-tendered').children[1].addEventListener('click', () => {
        handleReturn()
        updateAmtTenderedElement()
    })
})

// this function populates the snacks from the server
const populateSnacks = () => {
    fetch('http://localhost:3000/snacks')
    .then(response => response.json())
    .then(snackCollection => {
        let table = document.getElementById('snack-display')
        // iterate through the cells of the display case
        // add the snacks from the server to the case
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                let currentSnack = snackCollection[i * table.rows[0].cells.length + j]
                let dispalyWindow = table.rows[i].cells[j]
                if (currentSnack != undefined) {
                    dispalyWindow.innerHTML = `
                        <button type="button" class="snack-btn">
                            ${currentSnack.name}<br>
                            $${currentSnack.price.toFixed(2)}<br>
                            ${currentSnack.quantity} left
                        </button>
                    `
                    dispalyWindow.children[0].addEventListener('click', () => handleSnackOrder(currentSnack))
                } 
                else {
                    dispalyWindow.innerHTML = `<button type="button" disabled>Add Snack!</button>`
                }
            }
        }
    })
}

// this function will handle when a user tries to order a snack
const handleSnackOrder = (snack) => snack.quantity === 0 ?
    alert(`Stevo's Snack Sampler is out of ${snack.name}!`) : totalTendered() < snack.price ?
        alert(`You need to enter more money to purchase ${snack.name}!`) : snackDelivery(snack)

// this function executes when a snack is to be delivered to the customer
const snackDelivery = (snack) => {
    snack.quantity--
    fetch(`http://localhost:3000/snacks/${snack.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(snack)
    })
    .then(res => res.json)
    .then(populateSnacks())
}

// this object represents money that has been inserted into the machine
const tenderedMoney = {
    fivers: {quantity: 0, value: 5},
    bucks: {quantity: 0, value: 1},
    quarters: {quantity: 0, value: 0.25},
    dimes: {quantity: 0, value: 0.1},
    nickels: {quantity: 0, value: 0.05},
}

// this function adds money to the tenderedMoney object
const handleMoneyInstertion = (denomination) => tenderedMoney[denomination].quantity++

// this function returns the total value of the tenderedMoney
const totalTendered = () => Object.values(tenderedMoney).reduce((total, denomination) => total + denomination.quantity * denomination.value, 0)

// this function resets the tenderedMoney quantities to zero for all denominations
const handleReturn = () => Object.values(tenderedMoney).map(denomination => denomination.quantity = 0)

// this function updates the amount tendered HTML element
const updateAmtTenderedElement = () => document.getElementById('amt-tendered').children[0].textContent = `$${totalTendered().toFixed(2)}`
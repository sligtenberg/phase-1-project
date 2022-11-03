document.addEventListener('DOMContentLoaded', () => {
    populateSnacks();

    // listen for insert money buttons event
    for (let button of document.getElementById('add-money').children) {
        button.addEventListener('click', () => {
            tenderedMoney.addMoney(button.value)
            document.getElementById('amt-tendered').textContent = `$${tenderedMoney.total().toFixed(2)}`
        })
    }

    // listen for return money button event
    document.getElementById('return-money').addEventListener('click', () => {
        tenderedMoney.returnMoney()
        document.getElementById('amt-tendered').textContent = `$${tenderedMoney.total().toFixed(2)}`
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
    alert(`Stevo's Snack Sampler is out of ${snack.name}!`) : tenderedMoney.total() < snack.price ?
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
    money: {
        fivers: {quantity: 0, value: 5},
        bucks: {quantity: 0, value: 1},
        quarters: {quantity: 0, value: 0.25},
        dimes: {quantity: 0, value: 0.1},
        nickels: {quantity: 0, value: 0.05},
    },
    total: function () {
        return Object.values(this.money).reduce((total, denomination) => total + denomination.quantity * denomination.value, 0)
    },
    returnMoney: function () {
        Object.values(this.money).map(denomination => denomination.quantity = 0)
    },
    addMoney: function (denomination) {
        this.money[denomination].quantity++
    }
}
document.addEventListener('DOMContentLoaded', () => {
    populateSnacks();

    // listen for insert money button events
    for (let button of document.getElementById('add-money').children) {
        button.addEventListener('click', () => {
            tenderedMoney.addMoney(button.value)
            updateAmtTendered(tenderedMoney.total())
            updateDisplayCase()
        })
    }

    // listen for return money button event
    document.getElementById('return-money').addEventListener('click', () => {
        updateDisplayCase(moneyBoxToString(tenderedMoney.money))
        tenderedMoney.reset()
        updateAmtTendered(tenderedMoney.total())
    })

    // listen for radio button change
    document.getElementById('role-toggle').addEventListener('click', () => applyRole())

})

// this function switches us to the correct mode
const applyRole = () => {
    const custBtns = document.getElementsByClassName('customer')
    const maintBtns = document.getElementsByClassName('maintenance')
    if (document.getElementById('role-toggle').children[0].checked) {
        for (let button of maintBtns) {
            button.disabled = true
        }
        for (let button of custBtns) {
            button.disabled = false
        }
    }
    else {
        for (let button of maintBtns) {
            button.disabled = false
        }
        for (let button of custBtns) {
            button.disabled = true
        }
    }
}

// this object represents money that has been inserted into the machine
const tenderedMoney = {
    money: [
        {name: '$5.00 bill', quantity: 0, value: 5},
        {name: '$1.00 bill', quantity: 0, value: 1},
        {name: 'quarter',    quantity: 0, value: 0.25},
        {name: 'dime',      quantity: 0, value: 0.1},
        {name: 'nickel',     quantity: 0, value: 0.05},
    ],
    addMoney: function (denomination) {
        this.money[denomination].quantity++
    },
    total: function () {
        return this.money.reduce((total, denomination) => total + denomination.quantity * denomination.value, 0)
    },
    // this function is called when the return button is pushed
    // it does two things: 1) send a message describing the return, and 2) reset the money array to be empty
    reset: function () {
        this.money.map(denomination => denomination.quantity = 0) // set money box quantities to zero
    }
}

// this function takes a money array and returns a string describing it
const moneyBoxToString = (moneyArray) => {
    const returnSentence = []
    for (let denomination of moneyArray) {
        switch (denomination.quantity) {
            case 0: break
            case 1: {
                returnSentence.push(` ${denomination.quantity} ${denomination.name}`)
                break
            }
            default: returnSentence.push(` ${denomination.quantity} ${denomination.name}s`)
        }
    }
    return returnSentence
}

// this function updates the HTML element to reflect the amount of money the user has entered
// should be called: 1) when money is entered, 2) when something is purshased, 3) when money is returned
const updateAmtTendered = (amount) => document.getElementById('amt-tendered').textContent = `$${amount.toFixed(2)}`

// this function writes to the display case
// it will be called for three cases: 1) money sent to user, 2) snack sent to user, 3) error message sent to user
const updateDisplayCase = (content) => document.getElementById('dispenser').textContent = content

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
                        <button type="button" class="customer">
                            ${currentSnack.name}<br>
                            $${currentSnack.price.toFixed(2)}<br>
                            ${currentSnack.quantity} left
                        </button>
                        <button type="button" class="maintenance">Edit</button>
                    `
                    dispalyWindow.children[0].addEventListener('click', () => handleSnackOrder(currentSnack))
                } 
                else {
                    dispalyWindow.innerHTML = `<button type="button" class="maintenance">Add Snack!</button>`
                }
            }
        }
        applyRole()
    })
}

// this function will handle when a user tries to order a snack
const handleSnackOrder = (snack) => {
    if (snack.quantity === 0) updateDisplayCase(`Stevo's Snack Sampler is out of ${snack.name}`)
    else if (tenderedMoney.total() < snack.price) updateDisplayCase(`You need to enter more money to purchase ${snack.name}`)
    else getSnack(snack)
}

// this function takes a snack and tries to make change
// if it can make change:
//  - deliver the snack
//  - update the amount tendered
// if it cannot make change: alert the user that change cannot be made for thier order
const getSnack = (snack) => {
    fetch('http://localhost:3000/cash')
    .then(res => res.json())
    .then(availableMoney => {
        let changeNeeded = tenderedMoney.total() - snack.price
        const potentialChange = [0, 0, 0, 0, 0]
        for (let i = 0; i < availableMoney.length; i++) {
            while (changeNeeded >= tenderedMoney.money[i].value && availableMoney[i].quantity + tenderedMoney.money[i].quantity > 0) {
                potentialChange[i]++
                changeNeeded = (changeNeeded - tenderedMoney.money[i].value).toFixed(2)
            }
        }
        if (changeNeeded != 0) {
            updateDisplayCase(`Stevo's Snack Sampler can't make change for ${snack.name}`)
        }
        else {
            for (let i = 0; i < availableMoney.length; i++) {
                availableMoney[i].quantity += tenderedMoney.money[i].quantity -= potentialChange[i]
                tenderedMoney.money[i].quantity = potentialChange[i]
                fetch(`http://localhost:3000/cash/${i+1}`, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(availableMoney[i])
                })    
            }
            updateAmtTendered(tenderedMoney.total())
            snackDelivery(snack)
        }
    })
}

// this function executes when a snack should be delivered to the customer
const snackDelivery = (snack) => {
    console.log(snack.name)
    snack.quantity--
    updateDisplayCase(`${snack.name}!`)
    fetch(`http://localhost:3000/snacks/${snack.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(snack)
    })
    .then(res => res.json)
    .then(populateSnacks())
}
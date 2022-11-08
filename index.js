document.addEventListener('DOMContentLoaded', () => {
    getSnacks();

    // listen for insert money button events
    for (let button of document.getElementById('add-money').children[1].children) {
        button.addEventListener('click', () => {
            tenderedMoney.addMoney(button.value)
            updateAmtTendered(tenderedMoney.total())
            updateDispenser()
        })
    }

    // listen for return money button event
    document.getElementById('return-money').addEventListener('click', () => {
        updateDispenser(moneyBoxToString(tenderedMoney.money))
        tenderedMoney.reset()
        updateAmtTendered(tenderedMoney.total())
    })

    // listen for radio button change
    document.getElementById('role-toggle').addEventListener('click', () => {
        applyRole()
        updateDispenser()
    })

    // listen for cash drawer form submit
    document.getElementById('cash-drawer-submit').addEventListener('submit', (event) => {
        event.preventDefault()
        console.log(event)
    })
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
        document.getElementById('add-money').style.display = "block"
        document.getElementById('cash-drawer').style.display = "none"
        document.getElementById('dispenser').style.display = "block"
    }
    else {
        for (let button of maintBtns) {
            button.disabled = false
        }
        for (let button of custBtns) {
            button.disabled = true
        }
        document.getElementById('add-money').style.display = "none"
        document.getElementById('cash-drawer').style.display = "block"
        document.getElementById('dispenser').style.display = "none"
        populateCashDrawer()
    }
}

// this object represents money that has been inserted into the machine
const tenderedMoney = {
    money: [
        {name: '$5.00 bill', quantity: 0, value: 5},
        {name: '$1.00 bill', quantity: 0, value: 1},
        {name: 'quarter',    quantity: 0, value: 0.25},
        {name: 'dime',       quantity: 0, value: 0.1},
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
const updateDispenser = (content) => document.getElementById('dispenser').children[1].textContent = content

// this function fetches data from db.json and uses it to populate the cash drawer
const populateCashDrawer = () => {
    fetch('http://localhost:3000/cash')
    .then(response => response.json())
    .then(cashDrawer => {
        let table = document.getElementById('cash-drawer').children[3].children[1].children
        for (let i = 0; i < cashDrawer.length; i++) {
            table[i + 1].children[1].textContent = cashDrawer[i].quantity
        }
    })
}

// this function gets the snacks from the server
const getSnacks = () => {
    fetch('http://localhost:3000/snacks')
    .then(response => response.json())
    .then(snackCollection => {
        snackCollection.forEach(displaySnack)
        applyRole()
    })
}

// this function takes a snack and adds it to the proper place in the snack display
// the proper place is dictated by the snack id
const displaySnack = (snack) => {
    const table = document.getElementById('snack-display')
    let tableElement = table.rows[Math.floor(snack.id / table.rows.length)].cells[(snack.id - 1) % table.rows[0].cells.length]
    tableElement.innerHTML = `
        <button type="button" class="customer">
            ${snack.name}<br>
            $${snack.price.toFixed(2)}<br>
            ${snack.quantity} left
        </button>
        <button type="button" class="maintenance">Edit</button>
    `
    tableElement.children[0].addEventListener('click', () => handleSnackOrder(snack))
}

// this function will handle when a user tries to order a snack
const handleSnackOrder = (snack) => {
    if (snack.quantity === 0) updateDispenser(`Stevo's Snack Sampler is out of ${snack.name}`)
    else if (tenderedMoney.total() < snack.price) updateDispenser(`You need to enter more money to purchase ${snack.name}`)
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
        availableMoney.forEach(denomination => {
            const index = denomination.id - 1
            while (changeNeeded >= tenderedMoney.money[index].value && denomination.quantity + tenderedMoney.money[index].quantity > 0) {
                potentialChange[index]++
                changeNeeded = (changeNeeded - tenderedMoney.money[index].value).toFixed(2)
            }
        })
        // if we can make exact change
        // add the tendered money to the cash drawer object and then subtract the change needed
        // put that change back into the tendered money object
        // send a patch to update the cash drawer with the non-change
        // update the amount tendered display and deliver the snack
        if (parseInt(changeNeeded) === 0) {
            availableMoney.forEach(denomination => {
                const index = denomination.id - 1
                denomination.quantity += tenderedMoney.money[index].quantity -= potentialChange[index]
                tenderedMoney.money[index].quantity = potentialChange[index]
                fetch(`http://localhost:3000/cash/${denomination.id}`, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(availableMoney[index])
                })    
            })
            updateAmtTendered(tenderedMoney.total())
            snackDelivery(snack)
        }
        else {
            // add functionality to try again, but getting around the quarters and dimes problem
            updateDispenser(`Stevo's Snack Sampler can't make change for ${snack.name}`)
        }
    })
}

// this function executes when a snack should be delivered to the customer
// decrease the quantity of this particular snack
// send it to the display case
// send the updated snack back to the server 
// update the html element
const snackDelivery = (snack) => {
    snack.quantity--
    updateDispenser(`${snack.name}!`)
    fetch(`http://localhost:3000/snacks/${snack.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(snack)
    })
    .then(res => res.json())
    .then(displaySnack(snack))
}
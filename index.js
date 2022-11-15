document.addEventListener('DOMContentLoaded', () => {
    populateSnackDisplay();

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

    //listen for cash drawer form submit
    document.getElementById('cash-drawer').children[4].children[0].addEventListener('submit', (event) => {
        event.preventDefault()
        addMoneyToMachine(event.target)
    })

    // listen for auto reset
    document.getElementById('cash-drawer').children[1].addEventListener('click', autoReset)

    // listen for cancel btn
    document.getElementById('cash-drawer').children[2].addEventListener('click', () => {
        document.getElementById('cash-drawer').children[4].children[0].reset()
    })
})

// this is the default quantity of each denomination of change that the maintenance person should leave in the machine
// when autoRest is called, the fields to add money are automatically filled to set the money in the macihine to these numbers
const defaultCashDrawer = [0, 50, 200, 500, 500]

// this function resets the quantity of each denomination of change in the machine to a default level
const autoReset = () => {
    let tblRows = document.getElementById('cash-drawer').children[4].children[1].children
    for (let i = 0; i < defaultCashDrawer.length; i++) {
        tblRows[i+1].children[2].children[0].value = defaultCashDrawer[i] - tblRows[i+1].children[1].textContent
    }
}

// this function handles the maintenance action of adding money to the machine
const addMoneyToMachine = (submittedMoney) => {
    fetch('http://localhost:3000/cash')
    .then(res => res.json())
    .then(moneyInCashDrawer => {
        for (let i = 0; i < moneyInCashDrawer.length; i++) {
            if (submittedMoney[i + 1].value === '') submittedMoney[i + 1].value = 0
            moneyInCashDrawer[i].quantity += Number(submittedMoney[i + 1].value)
            document.getElementById('cash-drawer').children[4].children[1].children[i + 1].children[1].textContent = moneyInCashDrawer[i].quantity
        }
        sendMoneyInCashDrawer(moneyInCashDrawer)
        document.getElementById('cash-drawer').children[4].children[0].reset()
    })
}

// this function switches us to the correct mode
const applyRole = () => {
    const customerClass = document.getElementsByClassName('customer')
    const maintenanceClass = document.getElementsByClassName('maintenance')
    if (document.getElementById('role-toggle').children[0].checked) {
        for (let item of maintenanceClass) {
            item.disabled = true
            item.style.display = "none"
        }
        for (let item of customerClass) {
            item.disabled = false
            item.style.display = "block"
        }
    }
    else {
        for (let item of maintenanceClass) {
            item.disabled = false
            item.style.display = "block"
        }
        for (let item of customerClass) {
            item.disabled = true
            item.style.display = "none"
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

// this function writes to the dispenser
// it will be called for three cases: 1) money sent to user, 2) snack sent to user, 3) error message sent to user
const updateDispenser = (content) => document.getElementById('dispenser').children[1].textContent = content

// this function fetches data from db.json and uses it to populate the cash drawer
const populateCashDrawer = () => {
    fetch('http://localhost:3000/cash')
    .then(response => response.json())
    .then(cashDrawer => {
        let table = document.getElementById('cash-drawer').children[4].children[1].children
        for (let i = 0; i < cashDrawer.length; i++) {
            table[i + 1].children[1].textContent = cashDrawer[i].quantity
        }
    })
}

// this function gets the snacks from the server
const populateSnackDisplay = () => {
    fetch('http://localhost:3000/snacks')
    .then(response => response.json())
    .then(snackCollection => {
        snackCollection.forEach(displaySnack)
    })
}

// this function takes a snack and adds it to the proper place in the snack display
// the proper place is dictated by the snack id
const displaySnack = (snack) => {
    const table = document.getElementById('display').children[1]
    let tableElement = table.rows[Math.floor((snack.id - 1) / table.rows[0].cells.length)].cells[(snack.id - 1) % table.rows[0].cells.length]
    tableElement.innerHTML = `
        <button type="button" class="customer">
            ${snack.name}<br>
            $${snack.price.toFixed(2)}<br>
            ${snack.quantity} left
        </button>
        <form class="maintenance">
            <input type="text" placeholder="${snack.name}">
            <input type="text" placeholder="$${snack.price.toFixed(2)}">
            <input type="text" placeholder="${snack.quantity} left">
            <input type="submit" value="Submit"/>
        </form>
    `
    applyRole()
    tableElement.children[0].addEventListener('click', () => handleSnackOrder(snack))
    tableElement.children[1].addEventListener('submit', event => handleSnackEdit(event, snack))
}

const handleSnackEdit = (event, snack) => {
    event.preventDefault()
    const newName = event.target[0].value
    const newPrice = event.target[1].value
    const newQuantity = event.target[2].value
    if (newName != '') {
        snack.name = newName
    }
    if (typeof newPrice === "number") {
        snack.price = newPrice
    }
    if (typeof newQuantity === "number") {
        snack.quantity = newQuantity
    }
    console.log(snack)
    // send the fetch to update the snack
}

// this function will handle when a user tries to order a snack
const handleSnackOrder = (snack) => {
    if (snack.quantity === 0) updateDispenser(`Stevo's Snack Sampler is out of ${snack.name}`)
    else if (tenderedMoney.total() < snack.price) updateDispenser(`You need to enter more money to purchase ${snack.name}`)
    else purchaseSnack(snack)
}

// this function takes a snack and tries to make change
// if it can make change:
//  - deliver the snack
//  - update the amount tendered
// if it cannot make change: alert the user that change cannot be made for thier order
const purchaseSnack = async (snack) => {
    fetch('http://localhost:3000/cash')
    .then(res => res.json())
    .then(moneyInCashDrawer => {
        let changeNeeded = tenderedMoney.total() - snack.price
        const potentialChange = [0, 0, 0, 0, 0]
        for (let i = 0; i < moneyInCashDrawer.length; i++) {
            moneyInCashDrawer[i].quantity += tenderedMoney.money[i].quantity
            while (changeNeeded >= moneyInCashDrawer[i].value && moneyInCashDrawer[i].quantity > 0) {
                potentialChange[i]++
                moneyInCashDrawer[i].quantity--
                changeNeeded = (changeNeeded - moneyInCashDrawer[i].value).toFixed(2)
            }
        }
        if (Number(changeNeeded) === 0) {
            for (let i = 0; i < potentialChange.length; i++) {
                tenderedMoney.money[i].quantity = potentialChange[i]
            }
            sendMoneyInCashDrawer(moneyInCashDrawer)
            updateAmtTendered(tenderedMoney.total())
            snackDelivery(snack)
        }
        else {
            // add functionality to try again, but getting around the quarters and dimes problem
            updateDispenser(`Stevo's Snack Sampler can't make change for ${snack.name}`)
        }
    })
}

async function sendMoneyInCashDrawer(moneyToSend) {
    for (let i = 0; i < moneyToSend.length; i++) {
        await fetch(`http://localhost:3000/cash/${i+1}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(moneyToSend[i])
        })
        for (let i = 0; i < 100000000; i++) {} // dummy loop to delay the fetch requests
    }
}

// this function executes when a snack should be delivered to the customer
// decrease the quantity of this particular snack
// send it to the display case
// send the updated snack back to the server 
// update the html element
const snackDelivery = (snack) => {
    //for (i = 0; i < 1000000000; i++) {}
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
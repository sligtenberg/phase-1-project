document.addEventListener('DOMContentLoaded', () => {

    // these functions run BEFORE USER INPUT
    // both add event listeners which vary based on data on the server
    populateSnackDisplay()
    populateCashDrawer()

    // toggle customer mode and maintenance mode
    // listen for radio button change
    document.getElementById('role-toggle').addEventListener('click', () => {
        applyRole()
        updateDispenser()
        populateSnackDisplay()
        populateCashDrawer()
    })

    // CUSTOMER MODE EVENT LISTENERS:

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
        updateDispenser(describeChange(tenderedMoney.money))
        tenderedMoney.reset()
        updateAmtTendered(tenderedMoney.total())
    })

    // MAINTENANCE MODE EVENT LISTENERS:

    //listen for cash drawer form submit
    document.getElementById('cash-drawer').children[4].children[0].addEventListener('submit', event => {
        event.preventDefault()
        handleCashDrawerSubmit(event.target)
    })

    // listen for auto reset
    document.getElementById('cash-drawer').children[1].addEventListener('click', () => {
        let tblRows = document.getElementById('cash-drawer').children[4].children[1].children
        for (let i = 0; i < defaultCashDrawer.length; i++) {
            tblRows[i+1].children[2].children[0].value = defaultCashDrawer[i] - tblRows[i+1].children[1].textContent
        }
    })

    // listen for cancel btn
    document.getElementById('cash-drawer').children[2].addEventListener('click', () => {
        document.getElementById('cash-drawer').children[4].children[0].reset()
    })
})

// GLOBAL VARIABLES:

// this is the default quantity of each denomination of change that the maintenance person should leave in the machine
// when autoRest is called, the fields to add money are automatically filled to set the money in the macihine to these numbers
const defaultCashDrawer = [0, 50, 200, 500, 500]

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

// FUNCTIONS CALLED ON PAGE LOAD:

// populateSnackDisplay() fetches all the snacks from the server and sends them to the displaySnack functions
const populateSnackDisplay = () => {
    fetch('http://localhost:3000/snacks')
    .then(res => res.json())
    .then(snackCollection => snackCollection.forEach(displaySnack))
}

// populateCashDrawer fetches data from the server and uses it to populate the cash drawer current amounts
const populateCashDrawer = () => {
    fetch('http://localhost:3000/cashes')
    .then(res => res.json())
    .then(cashDrawer => {
        let table = document.getElementById('cash-drawer').children[4].children[1].children
        cashDrawer.forEach(denomination => table[denomination.id].children[1].textContent = denomination.quantity)
    })
}

// TOOL FUNCTIONS:

// updateSnackOnServer takes a snack object as an argument, and update that snack on the server via PATCH request
const updateSnackOnServer = snack => {
    fetch(`http://localhost:3000/snacks/${snack.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(snack)
    })
}

// sendMoneyInCashDrawer takes an array of money objects and sends them to the server via PATCH requests
const sendMoneyInCashDrawer = moneyToSend => {
  moneyToSend.forEach(denomination => {
    fetch(`http://localhost:3000/cashes/${denomination.id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(denomination)
    })
  })
}

// displaySnack takes a snack object as an arg and adds it to the proper place in the snack display - dictated by the snack id
// displaySnack builds the html element for the snack on both the customer side and the maintenance side
// display snack adds event listeners to the snacks
const displaySnack = snack => {
    const table = document.getElementById('display').children[1]
    let tableElement = table.rows[Math.floor((snack.id - 1) / table.rows[0].cells.length)].cells[(snack.id - 1) % table.rows[0].cells.length]
    tableElement.innerHTML = `
        <button type="button" class="customer">
            ${snack.name}<br>
            $${snack.price.toFixed(2)}<br>
            ${snack.quantity} left
        </button>
        <form class="maintenance">
            <span>Name: </span> <input type="text" value="${snack.name}"><br>
            <span>Price:</span> <input type="number" value="${snack.price.toFixed(2)}" min="0" step="0.05"><br>
            <span>Quantiy:</span> <input type="number" value="${snack.quantity}" min="0"><br>
            <input type="submit" value="Update"/>
        </form>
    `
    applyRole()
    tableElement.children[0].addEventListener('click', () => handleSnackOrder(snack))
    tableElement.children[1].children[4].addEventListener('change', () => {
        tableElement.children[1].children[4].value = Number(tableElement.children[1].children[4].value).toFixed(2)
    })
    tableElement.children[1].addEventListener('submit', event => handleSnackEditSubmit(event, snack))
}

// describeChange takes a money array and returns an array which better desbribes it
const describeChange = moneyArray => {
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

// updateDispenser takes content as an arg writes it in the dispenser area for the user to view
// it will be called for three cases: 1) money sent to user, 2) snack sent to user, 3) error message sent to user
// also called with no arg in order to delete the content in the dispenser area
const updateDispenser = content => document.getElementById('dispenser').children[1].textContent = content

// updateAmtTendered updates the 'amt-tendered' HTML element to reflect the amount of money the user has entered
// should be called: 1) when money is entered, 2) when something is purshased, 3) when money is returned
const updateAmtTendered = amount => document.getElementById('amt-tendered').textContent = `$${amount.toFixed(2)}`

// this function executes when a snack should be delivered to the customer
// decrease the quantity of this particular snack
// send it to the display case
// send the updated snack back to the server 
// update the html element
const snackDelivery = snack => {
    snack.quantity--
    updateDispenser(`${snack.name}!`)
    updateSnackOnServer(snack)
    displaySnack(snack)
}

// MODE TOGGLE:

// applyRole toggles between customer and maintenance mode
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
    }
}

// FUNCTIONS CALLED BY CUSTOMER MODE BUTTONS:

// handleSnackOrder is called when a user clicks a snack button
// 1) checks if there are any left
// 2) checks if enough money has been inserted
// 3) fetches cash from the server
// 4) adds the money that has been tendered to the serverside cash
// 5) checks if change can be made
// 5) sends the snack to the customer, updates the server, and updates the amount tendered
const handleSnackOrder = snack => {
    if (snack.quantity === 0) updateDispenser(`Stevo's Snack Sampler is out of ${snack.name}`)
    else if (tenderedMoney.total() < snack.price) updateDispenser(`You need to enter more money to purchase ${snack.name}`)
    else {
        fetch('http://localhost:3000/cashes')
        .then(res => res.json())
        .then(moneyInCashDrawer => {
            moneyInCashDrawer.sort((a, b) => a.id - b.id) // need moneyInCashDrawer to have matching index of tenderedMoney
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
}

// FUNCTIONS CALLED BY MAINTENACE MODE BUTTONS:

// handleCashDrawerSubmit takes the quantities added by the user as an arg and updates the server with that data
// 1) get the money array from the server
// 2) loop through money array, adding the newly added amounts to the money on the server
// 3) send the new array back to the server
const handleCashDrawerSubmit = submittedMoney => {
    fetch('http://localhost:3000/cashes')
    .then(res => res.json())
    .then(moneyInCashDrawer => {
      moneyInCashDrawer.forEach(denomination => {
        denomination.quantity += Number(submittedMoney[denomination.id].value) // add the quantities added by the user
        document.getElementById('cash-drawer').children[4].children[1].children[denomination.id].children[1].textContent = denomination.quantity
      })
      sendMoneyInCashDrawer(moneyInCashDrawer)
      document.getElementById('cash-drawer').children[4].children[0].reset()
    })
}

// handleSnackEditSubmit takes edits made to a snack (form submission) and a snack as args, and updates the snack on the server
// called as a result of a submit event
// need to add ability to prevent bad submissions (negative quantities, prices, non-numbers, etc.)
const handleSnackEditSubmit = (event, snack) => {
    event.preventDefault()
    snack.name = event.target[0].value
    snack.price = Number(event.target[1].value)
    snack.quantity = Number(event.target[2].value)
    updateSnackOnServer(snack)
}
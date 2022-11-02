document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('amt-tendered').children[2].addEventListener('click', () => tenderedMoney.returnMoney())
    handleMoneyInstertion();
})

// this function adds event listeners to the money tendering buttons
// the event listener calls handleMoneyTenderButton and passes the button that was clicked as an arg
function handleMoneyInstertion () {
    let intertButtons = document.getElementById('add-money').children
    for (let button of intertButtons) {
        button.addEventListener('click', () => handleMoneyTenderButton(button))
    }
}

// this function is called when the money tendered button is clicked
// it updates the tenderedMoney object
function handleMoneyTenderButton (button) {
    tenderedMoney[button.value]++
    updateAmtTenderedElement ()
}

// this object contains the information of what money has been deposited into the machine
const tenderedMoney = {
    fivers: 0,
    bucks: 0,
    quarters: 0,
    dimes: 0,
    nickels: 0,
    total: function () {
        return this.fivers * 5 + this.bucks + this.quarters * 0.25 + this.dimes * 0.1 + this.nickels * 0.05
    },
    returnMoney: function () {
        this.fivers = 0
        this.bucks = 0
        this.quarters = 0
        this.dimes = 0
        this.nickels = 0
        updateAmtTenderedElement ()
    }
}

// this function will update the HTML element which displays the amount tentered
// this will need to be called after money is tendered, and after change is returned
function updateAmtTenderedElement () {
    document.getElementById('amt-tendered').children[1].textContent = `$${tenderedMoney.total().toFixed(2)}`
}
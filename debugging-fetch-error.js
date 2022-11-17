// this function takes a snack and tries to make change
// if it can make change:
//  - deliver the snack
//  - update the amount tendered
// if it cannot make change: alert the user that change cannot be made for thier order
// const purchaseSnack = async (snack) => {
//     fetch('http://localhost:3000/cash')
//     .then(res => res.json())
//     .then(moneyInCashDrawer => {
//         let changeNeeded = tenderedMoney.total() - snack.price
//         const potentialChange = [0, 0, 0, 0, 0]
//         for (let i = 0; i < moneyInCashDrawer.length; i++) {
//             moneyInCashDrawer[i].quantity += tenderedMoney.money[i].quantity
//             //debugger
//             while (changeNeeded >= moneyInCashDrawer[i].value && moneyInCashDrawer[i].quantity > 0) {
//                 //debugger
//                 potentialChange[i]++
//                 moneyInCashDrawer[i].quantity--
//                 changeNeeded = (changeNeeded - moneyInCashDrawer[i].value).toFixed(2)
//                 //debugger
//             }
//         }
//         //debugger
//         if (Number(changeNeeded) === 0) {

//             // update the tenderedMoney object - this is only necessary with some of the fetch versions below
//             for (let i = 0; i < potentialChange.length; i++) {
//                 tenderedMoney.money[i].quantity = potentialChange[i]
//             }

/*******************************************************************************************************
 * The code below randomly encounters:
 * 
 * PATCH http://localhost:3000/snacks/1 net::ERR_CONNECTION_REFUSED
 *  snackDelivery @ index.js:367
 *  dummy @ index.js:212
 *  Promise.then (async)
 *  purchaseSnack @ index.js:161
 *  handleSnackOrder @ index.js:150
 *  (anonymous) @ index.js:143
 *
 *      AND 
 * 
 * Uncaught (in promise) TypeError: Failed to fetch
 *      at snackDelivery (index.js:367:5)
 *      at dummy (index.js:212:19)
 *  snackDelivery @ index.js:367
 *  dummy @ index.js:212
 *  Promise.then (async)
 *  snackDelivery @ index.js:373
 *  dummy @ index.js:212
 *  Promise.then (async)
 *  purchaseSnack @ index.js:161
 *  handleSnackOrder @ index.js:150
 *  (anonymous) @ index.js:143
 * 
 * This error occers at random times and appears to be a problem with the JSON server. My best guess at
 * the cause is a race condition arising due to multiple fetch requests. The error can be solved by adding 
 * a dummy counter:
 * 
 * for (let i = 0; i < 100000000; i++) {}
 * 
 * which slows the loop down and prevents the fetch requests from "lapping" each other, which is the
 * suspected origin of the race condition. Below are multiple attempted solutions, with commentary. None
 * of the solutions resolve the issue. The only solution that reliably works is the dummy for loop, which
 * is a terrible fix for a simple, but strange problem.
 * 
 * This error has been difficult to understand because of its seemingly random nature. Additionally, the 
 * PATCH request successfully completes, all code execute, the fetch response reads successfully, and 
 * everything functions as expected. The only effect is an error printed to the console.
 * 
 * New development: the frequency of error occurance is directly related to the dummy loop length. Strong
 * evidence for race condition existance
 ********************************************************************************************************/

            // ************************ original fetch design ************************
            // This works if the dummy loop is uncommented. This code holds the greatest evidence
            // for a race condition. When we add the dummy for loop, the error never occurs.
            // However, when run with the await statement, the result should be the same, but it
            // is not. The error returns.

            // for (let i = 0; i < moneyInCashDrawer.length; i++) {
            //     tenderedMoney.money[i].quantity = potentialChange[i]    
            //     const response = await fetch(`http://localhost:3000/cash/${i+1}`, {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[i])
            //     })
            //     //for (let i = 0; i < 100000000; i++) {}
            //     //console.log(response)
            //     //console.log(i)
            // }
            //console.log(snack)

            // ************************ for await fetch design ************************
            // for await (let denomination of moneyInCashDrawer) {
            //     //tenderedMoney.money[i].quantity = potentialChange[i]    
            //     const response = fetch(`http://localhost:3000/cash/${denomination.id}`, {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(denomination)
            //     })
            //     //for (let i = 0; i < 100000000; i++) {}
            //     //console.log(response)
            //     //console.log(i)
            // }
            // **************************************************************************

            // ************************ hard cooded (no loop) fetch design ************************
            // This code should presumably force each fetch to wait for the previous fetch
            // to resolve before starting the next one. This code still produces the random error.
            // This may be evidence that we are not in fact dealing with a race condition, because
            // the .then statements should prevent fetch requests from "lapping" each other.

            // fetch('http://localhost:3000/cash/1', {
            //     method: 'PATCH',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(moneyInCashDrawer[0])
            // })
            // .then(fetch('http://localhost:3000/cash/2', {
            //     method: 'PATCH',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(moneyInCashDrawer[1])
            //     })
            // )
            // .then(fetch('http://localhost:3000/cash/3', {
            //     method: 'PATCH',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(moneyInCashDrawer[2])
            //     })
            // )
            // .then(fetch('http://localhost:3000/cash/4', {
            //     method: 'PATCH',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(moneyInCashDrawer[3])
            //     })
            // )
            // .then(fetch('http://localhost:3000/cash/5', {
            //     method: 'PATCH',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(moneyInCashDrawer[4])
            //     })
            // )
            // .then(snackDelivery(snack))
            // **************************************************************************

            // ************************ Promise.all fetch design ************************
            // this option behaves the same as the no loop design

            // still fails
            // Promise.all([
            //     fetch('http://localhost:3000/cash/1', {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[0])
            //     }),
            //     fetch('http://localhost:3000/cash/2', {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[1])
            //     }),
            //     fetch('http://localhost:3000/cash/3', {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[2])
            //     }),
            //     fetch('http://localhost:3000/cash/4', {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[3])
            //     }),
            //     fetch('http://localhost:3000/cash/5', {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[4])
            //     }).then(snackDelivery(snack))
            // ])
            // **************************************************************************

            // ************************ Outsourced fetch design ************************
            // in this attempt, we write the whole fetch loop into a separate, async
            // function, which we call here. this fails to resolve the error

            // await sendMoneyInCashDrawer(moneyInCashDrawer)
            // **************************************************************************

            // ********************* recursive fetch attempt **********************************
            // here we attempt to resolve the error by replacing the loop with a recursive 
            // algoritm, which should force the upcoming fetch to wait for the promise from 
            // the previous fetch to resolve before executing. this attempted failed to resolve
            // the error

            // const recursiveSolution = (index) => {
            //     //debugger
            //     if (index > 4) {
            //         updateAmtTendered(tenderedMoney.total())
            //         snackDelivery(snack)
            //         return
            //     }
            //     //tenderedMoney.money[index].quantity = potentialChange[index]
            //     //debugger
            //     fetch(`http://localhost:3000/cash/${index+1}`, {
            //         method: 'PATCH',
            //         headers: {'Content-Type': 'application/json'},
            //         body: JSON.stringify(moneyInCashDrawer[index])
            //     })
            //     .then(res => res.json())
            //     .then(() => {
            //         recursiveSolution(index + 1)
            //     })
            // }
            // recursiveSolution(0)
            // ************************************************************************************

            // ********************* fetch async attempt **********************************
            // This is another structure for asynchronously sending the fetch

            // async function sendFetches () {
            //     for (let i = 0; i < moneyInCashDrawer.length; i++) {
            //         tenderedMoney.money[i].quantity = potentialChange[i]    
            //         //console.log('moneyInCashDrawer[i]: ', moneyInCashDrawer[i])
            //         //console.log('i: ', i)
            //         const response = await fetch(`http://localhost:3000/cash/${i+1}`, {
            //             method: 'PATCH',
            //             headers: {'Content-Type': 'application/json'},
            //             body: JSON.stringify(moneyInCashDrawer[i])
            //         })
            //         console.log(response)
            //         //for (let i = 0; i < 100000000; i++) {}
            //     }
    
            // }
            // sendFetches()
            // ************************************************************************************

            // ********************* outsourced fetch async attempt **********************************
            // Here again we outsource the fetch, but this time within the loop.
            // This solution doesn't work because we are doing the await within the outsourced function,
            // but we are failing to make the loop wait for the responce

            // for (let i = 0; i < moneyInCashDrawer.length; i++) {
            //     tenderedMoney.money[i].quantity = potentialChange[i]
            //     sendFetch(moneyInCashDrawer[i])
            //     for (let i = 0; i < 100000000; i++) {}
            // }
            // ************************************************************************************
//             sendMoneyInCashDrawer(moneyInCashDrawer)
//             updateAmtTendered(tenderedMoney.total())
//             snackDelivery(snack)
//         }
//         else {
//             // add functionality to try again, but getting around the quarters and dimes problem
//             updateDispenser(`Stevo's Snack Sampler can't make change for ${snack.name}`)
//         }
//     })
// }

// the following two functions are part of the race condition experimentation 
// fails
// async function sendMoneyInCashDrawerTest(moneyToSend) {
//     for (let i = 0; i < moneyToSend.length; i++) {
//         await fetch(`http://localhost:3000/cash/${i+1}`, {
//             method: 'PATCH',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(moneyToSend[i])
//         })
//         //for (let i = 0; i < 100000000; i++) {} // dummy loop to delay the fetch requests
//     }
// }

// fails
// async function sendFetch (denomination) {
//     console.log(denomination)
//     await fetch(`http://localhost:3000/cash/${denomination.id}`, {
//         method: 'PATCH',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(denomination)
//     })
// }

// this function executes when a snack should be delivered to the customer

const downloadMoneyFromCashDrawerTest = () => {
    fetch('http://localhost:3000/cash')
    .then(res => res.json())
    .then(moneyInCashDrawer => {
        console.log(moneyInCashDrawer)
        sendMoneyInCashDrawerTest(moneyInCashDrawer)
    })
}

const sendMoneyInCashDrawerTest = moneyToSend => {
    for (let i = 0; i < moneyToSend.length; i++) {
        fetch(`http://localhost:3000/cash/${i+1}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(moneyToSend[i])
        })
    }
}

downloadMoneyFromCashDrawerTest()
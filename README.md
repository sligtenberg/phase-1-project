# Stevo's Snack Sampler Intro

Stevo's Snack Sampler is a vending machine interface, intended to provide a tasteful virtual vending machine experience. The goal is mimic a real-life vending machine for both customer interactions, and maintenance needs.

Use the radio toggle at the top of the page to switch between customer mode and maintenance mode.

# Implementation

To install Stevo's Snack Sampler, clone the repository to your local environement. The snack list and cash drawer data is stored in the db.json file. Start a JSON server to access it using the command:

$json-server --watch db.json

This will create a server storing the snack data at http://localhost:3000/snacks and the cash drawer data at http://localhost:3000/snacks/cash. In another terminal window, open index.html to use the application in a browser.

# Customer mode

In customer mode, a user can insert money in denominations of $5.00 bills, $1.00 bills, quarters, dimes, and nickels, by pressing buttons. The machine displays a live reading of the total value of the money which has been tendered.

The return money button resets the amount tendered to zero and sends the money that was returned to the dispenser.

The display shows which snacks are available, their price, and the quantity left. If a snack is clicked the following takes place:
 - If there are no more left, a message is displayed in the dispenser.
 - If the user has not entered enough money, a message is displayed in the dispenser.
 - If the machine cannot make the correct change for the bills which were entered, a message is displayed in the dispenser.
 - Otherwise, the snack is deliver to the customer, the snack's value is subtraced from the amount tendered, and the snack's quantity is decreased.

After ordering a snack, the customer may choose to enter more money, buy anoter snack, or have their change returned.

# Maintenance mode

In maintenance mode, a user can restock the machine with snacks, restock the machine with money, and remove money that the machine has collected.

 - To edit snacks, click the edit button in the snack display.
 - To add a new snack, click add snack in the display.
 - To add money to the machine, enter the quantity in the appropriet field in the cash drawer. Negative numbers subtract money from the machine.
 - Auto reset adds/subtracts money to set the machine back to a default cash drawer level.

 # Back end

 Behind the scenes, Stevo's Snack Sampler store information about the snacks and money that are in the machine in a db.json file. When a customer purshases a snack, the quantity of that snack is decreased on the server. When money is entered, or change is made, this information is persisted to the server. In maintenance mode, users may edit the snacks and alter the amount of money stored in the machine, effecting its abaility to make change. When these changes are made, that information is persisted to the server. The goal for this project, is to mimic as cosely as possible a real vending machine interface.
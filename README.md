# Stevo's Snack Sampler

Stevo's Snack Sampler is a vending machine interface, intended to provide a tasteful virtual vending machine experience. The goal is mimic a real-life vending machine for both customer interactions, and maintenance needs.

Use the radio toggle at the top of the page to switch between customer mode and maintenance mode

# Customer mode

In customer mode, a user can insert money in denominations of $5.00 bills, $1.00 bills, quarters, dimes, and nickels, by pressing buttons. The machine displays a live reading of the total value of the money which has been tendered.

The return money button resets the amount tendered to zero and sends the money that was returned to the dispenser.

The display shows which snacks are available, their price, and the quantity left. If a snack is clicked the following takes place:
 - If there are more left, a message is displayed in the dispenser.
 - If the user has not entered enough money, a message is displayed in the dispenser.
 - If the machine cannot make the correct change for the bills which were entered, a message is displayed in the dispenser.
 - Otherwise, the snack is deliver to the customer, the snack's value is subtraced from the amount tendered, and the snack's quantity is decreased

After ordering a snack, the customer may choose to enter more money, buy anoter snack, or have their change returned.

# Maintenance mode

In maintenance mode, a user can restock the machine with snacks, restock the machine with money, and remove money that the machine has collected.

 - To edit snacks, click the snack in the display.
 - To add a new snack, click add snack in the display.
 - To add money to the machine, enter the quantity in the appropriet field in the cash drawer. Negative numbers subtract money from the machine.
 - Auto reset adds/subtracts money to set the machine back to a default cash drawer level.
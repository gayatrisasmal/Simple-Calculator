// DISPLAY

const display = document.getElementById("display");

// CALCULATOR BUTTONS
const buttons = document.querySelectorAll("[data-value]");

// CLEAR AND EQUAL BUTTONS
const clearButton = document.getElementById("clear");
const equalButton = document.getElementById("equal");

// HISTORY ELEMENTS
const historyButton = document.getElementById("historyButton");
const historyPanel = document.getElementById("historyPanel");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");


// CALCULATOR EXPRESSION
let expression = "";

// GET HISTORY FROM LOCAL STORAGE
let history = JSON.parse(
        localStorage.getItem("calculatorHistory")
    ) || [];


// Display saved history when page loads
displayHistory();


// NUMBER AND OPERATOR BUTTONS

buttons.forEach(function (button) {

    button.addEventListener("click", function () {

        const value = button.getAttribute("data-value");
        expression = expression + value;
        display.value =  expression;

    });

});


// CLEAR BUTTON
clearButton.addEventListener("click", function () {

    expression = "";
    display.value = "0";

});


// EQUAL BUTTON
equalButton.addEventListener("click", function () {
    // Check if there is an expression

    if (expression === "") {

        return;
    }

    try {

        // Keep original expression
        const originalExpression =  expression;

        // Calculate the expression

        const result = calculate(expression);

        // Show result

        display.value =  result;

        // Use result for next calculation

        expression = result.toString();

        // Save calculation to history
        addToHistory(
            originalExpression,
            result
        );

    }


    catch (error) {

        display.value = "Error";

        expression = "";

    }

});



// ADD TO HISTORY

function addToHistory(expression, result) {

    // Create calculation object

    const calculation = {

        expression: expression,
        result: result

    };


    // Add calculation to history array

    history.push(calculation);

    // Save history in browser

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );

    // Update history page
      displayHistory();
}



// DISPLAY HISTORY
function displayHistory() {

    // Clear existing history

    historyList.innerHTML = "";

    // If history is empty

    if (history.length === 0) {

        historyList.innerHTML = `
            <p class="empty-history">
                No calculations yet
            </p>
        `;

        return;

    }


    // Start from newest calculation

    for (
        let i = history.length - 1;
        i >= 0;
        i--
    ) {

        const calculation =
            history[i];


        // Create history item

        const historyItem =
            document.createElement("div");


        // Add CSS class

        historyItem.classList.add(
            "history-item"
        );


        // Add calculation text

        historyItem.textContent =
            calculation.expression +
            " = " +
            calculation.result;


        // Add item to history list

        historyList.appendChild(
            historyItem
        );

    }

}

// OPEN HISTORY

historyButton.addEventListener("click", function () {

    // Show full-screen history

    historyPanel.classList.add("show");

});

// CLOSE HISTORY

closeHistory.addEventListener("click", function () {

    // Hide history page

    historyPanel.classList.remove("show");

});

// CALCULATOR

function calculate(expression) {

    // CHANGE CALCULATOR SYMBOLS

    expression = expression
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-");

    // PERCENTAGE
    
    expression = expression.replace(
        /(\d+(\.\d+)?)%/g,
        "($1/100)"
    );

    // CHECK INVALID CHARACTERS
    

    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {

        throw new Error(
            "Invalid expression"
        );

    }

    // CREATE TOKENS

    const tokens =
        expression.match(
            /(\d+(\.\d+)?)|[+\-*/()]/g
        );


    if (!tokens) {

        throw new Error(
            "Invalid expression"
        );

    }


    let position = 0;

    // ADDITION AND SUBTRACTION

    function parseExpression() {

        let result =
            parseTerm();


        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {

            const operator =
                tokens[position];


            position++;


            const nextNumber =
                parseTerm();


            if (operator === "+") {

                result =
                    result + nextNumber;

            }

            else {

                result =
                    result - nextNumber;

            }

        }


        return result;

    }

    // MULTIPLICATION AND DIVISION

    function parseTerm() {

        let result =
            parseFactor();


        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {

            const operator =
                tokens[position];


            position++;


            const nextNumber =
                parseFactor();


            if (operator === "*") {

                result =
                    result * nextNumber;

            }

            else {

                // Prevent division by zero

                if (nextNumber === 0) {

                    throw new Error(
                        "Cannot divide by zero"
                    );

                }


                result =
                    result / nextNumber;

            }

        }


        return result;

    }

    // NUMBERS AND BRACKETS

    function parseFactor() {

        const token =
            tokens[position];


        // Opening bracket

        if (token === "(") {

            position++;
            const result = parseExpression();

            // Check closing bracket

            if (
                tokens[position] !== ")"
            ) 
            {

                throw new Error(
                    "Missing bracket"
                );

            }

            position++;
            return result;

        }

        // Number

        if (!isNaN(token)) {

            position++;

            return Number(token);

        }


        throw new Error(
            "Invalid number"
        );

    }

    // START CALCULATION

    const result = parseExpression();

    // CHECK EVERYTHING WAS PROCESSED

    if (
        position !== tokens.length
    ) {

        throw new Error(
            "Invalid expression"
        );

    }

    // CHECK RESULT

    if (!isFinite(result)) {

        throw new Error(
            "Invalid result"
        );

    }


    // Return result

    return Number(
        result.toFixed(10)
    );

}
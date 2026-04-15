//trying format for inner list :: gemini recomend
//Intl.NumberFormat

const formatMoney = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD'
});

//format gemini end recomend


const balanceEl = document.getElementById("balance");
  
const incomeAmountEl = 
  document.getElementById("income-amount");
const expenseAmountEl =
  document.getElementById('expense-amount');

const transactionListEl =
  document.getElementById('transaction-list');
const transactionFormEl =
  document.getElementById('transaction-form');
const descriptionEl =
  document.getElementById('description');
const amountEl =
  document.getElementById('amount');

// un dimming
const ListEl = document.getElementById('transaction-list');

let transaction = JSON.parse(localStorage.getItem('transaction-list')) || [];
// un dimming done

let transactions =
  JSON.parse(localStorage.getItem('transactions'))
|| [];

transactionFormEl.addEventListener('submit', addTransaction);

function addTransaction (e) {
e.preventDefault();  

  // psswrd gateway step 3 added
  const unlocked = sessionStorage.getItem("unlocked");
  if (!unlocked) {
    showPasswordPrompt();
    return;
  }

// get form values
const description = descriptionEl.value.trim();
const amount = parseFloat(amountEl.value);
//
if (!description || isNaN(amount)) return; 

  transactions.push({
    id: Date.now(),
    description,
    amount
  })

  localStorage.setItem('transactions',JSON.stringify(transactions))

  // You need to clear the input fields so the user can type the next entry.
  transactionFormEl.reset();

//start 2 methods 
//saturday
updateTransactionList();
  //sunday
updateSummary();
}

function updateTransactionList() {
  transactionListEl.innerHTML = " ";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach(transaction => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);   
  }); 
}

function createTransactionElement(transaction) {
  const li = document.createElement('li');
  li.classList.add('transaction')
  li.classList.add(transaction.amount > 0 ? "income" : "expense")
//


// todo: update the Amount Formatting   
li.innerHTML = `
<span>${transaction.description}</span>
<span>${formatMoney.format(transaction.amount)}
<button class="delete-btn" onclick="removeTransaction(${transaction.id})"> x </button>
</span>`;
 
  return li; 
}
  
// from gem
function removeTransaction(id) {
  // 1. Filter out the transaction that matches the ID
  transactions = transactions.filter(transaction => transaction.id !== id);

  // 2. Update Local Storage
  localStorage.setItem('transactions', JSON.stringify(transactions));

  // 3. Refresh the UI
  updateTransactionList();
  updateSummary(); // This ensures your totals update too!
}

// method 2 sunday
function updateSummary() {

  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const income = transactions
  .filter((transaction) => transaction.amount > 0)
  .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expense = transactions
  .filter((transaction) => transaction.amount < 0)
  .reduce((acc, transaction) => acc + transaction.amount, 0);

  //update UI *from vid :: todoLater => formatting for Amount
  
// did with co-pilot
balanceEl.textContent = formatMoney.format(balance);
incomeAmountEl.textContent = formatMoney.format(income);
expenseAmountEl.textContent = formatMoney.format(expense);
}
// balance is next method .... thinking

// extra UX feature 
//document.getElementById("insertDash").addEventListener("click", () => {
  //const input = document.getElementById("amount");
  //const start = input.selectionStart;
  //const end = input.selectionEnd;

  //input.value = input.value.slice(0, start) + "-" + input.value.slice(end);

  //input.selectionStart = input.selectionEnd = start + 1;
  //input.focus();
//});

// try2 from co-pilot
const input = document.getElementById('amount');
document.querySelector('.btn-inc').addEventListener('click', () => input.stepUp());
document.querySelector('.btn-dec').addEventListener('click', () => input.stepDown());

// sound try create for submit button

const context = new window.AudioContext();

function playSuccess() {
    const successNoise = context.createOscillator();
    successNoise.frequency = "600";
    successNoise.type = "triangle";
    //successNoise.frequency.exponentialRampToValueAtTime(
 //       800,
 //       context.currentTime + 0.05
 //   );
    //successNoise.frequency.exponentialRampToValueAtTime(
//        1000,
 //       context.currentTime +   //0.15
  //  );

    successGain = context.createGain();
    successGain.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.8
    );

    successFilter = context.createBiquadFilter("lowpass");
    successFilter.Q = 10;
/*bandpass 0.01 */
    successNoise
        .connect(successFilter)
        .connect(successGain)
        .connect(context.destination);
    successNoise.start();
    successNoise.stop(context.currentTime + 0.8);
}

// sound try on submit button

let successButton = document.querySelector("#success");
successButton.addEventListener("click", function() {
  playSuccess("triangle");
})
//last (psswrd) bit strt

// -----------------------------
// PASSWORD SYSTEM
// -----------------------------

const passwordModal = document.getElementById("password-modal");
const passwordInput = document.getElementById("password-input");
const passwordSubmit = document.getElementById("password-submit");
const passwordError = document.getElementById("password-error");
const openAddBtn = document.getElementById("open-add-btn");

// Open Add Transaction (with password gate)
/* 201 to 2011 can go
openAddBtn.addEventListener("click", () => {
  const savedPassword = localStorage.getItem("trackerPassword");
  const unlocked = sessionStorage.getItem("unlocked");

  if (!savedPassword || !unlocked) {
    showPasswordPrompt();
  } else {
    showAddTransactionPanel();
  }
});
211 can go*/
/* step 1 added */
openAddBtn.addEventListener("click", openAddTransaction);
/* step 2 added */
function openAddTransaction() {
  const savedPassword = localStorage.getItem("trackerPassword");
  const unlocked = sessionStorage.getItem("unlocked");

  if (!savedPassword || !unlocked) {
    showPasswordPrompt();
    return;
  }

  showAddTransactionPanel();
}

// Show password modal
function showPasswordPrompt() {
  passwordModal.classList.remove("hidden");
  passwordInput.value = "";
  passwordError.classList.add("hidden");
  passwordInput.focus();
}

// Handle password submit
passwordSubmit.addEventListener("click", () => {
  const input = passwordInput.value.trim();
  const savedPassword = localStorage.getItem("trackerPassword");

  // First time ever → set password
  if (!savedPassword) {
    localStorage.setItem("trackerPassword", input);
    sessionStorage.setItem("unlocked", "true");
    closePasswordModal();
    showAddTransactionPanel();
    return;
  }

  // Existing password → verify
  if (input === savedPassword) {
    sessionStorage.setItem("unlocked", "true");
    closePasswordModal();
    showAddTransactionPanel();
  } else {
    passwordError.classList.remove("hidden");
    passwordInput.classList.add("shake");
    setTimeout(() => passwordInput.classList.remove("shake"), 300);
  }
});

// Close modal
function closePasswordModal() {
  passwordModal.classList.add("hidden");
}
// (psswrd) bit 1of2 end

// (psswrd bit) 2of2 strt
function showAddTransactionPanel() {
  // your existing code that opens the Add Transaction UI
}


// Existing content up to line 113

// After removeTransaction function
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// localStorage (saveTransaction above)
// Restore long version +  add persistence (the saveTransaction stuff)







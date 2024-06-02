'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-07-08T23:36:17.929Z',
    '2022-07-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//#1-format date
const formatMovementDate = function (date, locale) {
  const calcDaysPass = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPass(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, '0');
    // const month = `${date.getMonth() + 1}`.padStart(2, '0');
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//#2-display movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCurr(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>

        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//#3-Display balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

//#4- Display summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

//#5- Create usernames
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//#6- Update UI
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//#7- Format currency
const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//#8- logout timer

const startLogOutTimer = function () {
  const tick = function () {
    // Display the number in mins and seconds

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When is time is at 0 sec, stop timer and log out user
    if (time == 0) {
      clearInterval(timer);

      //resetting the welcome message
      labelWelcome.textContent = `Log in to get started`;
      //Opacity to 0
      containerApp.style.opacity = 0;
    }

    //decrease one sec
    time--;
  };

  //set time to 5 mins
  let time = 120;

  //Call the timer every seconds
  tick();

  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//#1- FAKE ALWAYS LOGGED IN

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Experimenting API

//#2- login button
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time

    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day1 = `${now.getDate()}`.padStart(2, 0);
    // const month1 = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year1 = now.getFullYear();
    // const hour1 = now.getHours();
    // const min1 = now.getMinutes();

    // labelDate.textContent = `${day1}/${month1}/${year1}, ${hour1}: ${min1}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // logout tmer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

//#3- Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);

    //reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//#4- Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date

      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
    //reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

//#5- Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// #6- Sort
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//#170-Converting and checking numbers

//Conversion
console.log(23 === 23.0);
console.log(+'23');

//Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23', 10));

console.log(Number.parseFloat('2.5rem'));

const unit = parseFloat('2.5px');
console.log(unit);

//Check if value is not a number
console.log(Number.isNaN(20));
console.log(Number.isNaN(+'20x'));
console.log(Number.isNaN('20'));

//checking if the value is number
console.log(Number.isFinite(30));
console.log(Number.isFinite(20 / 3));

// checking if its integer

console.log(Number.isInteger(23.3));

console.log(Number.isInteger(23 / 0));

//#171-Math and rounding
console.log(Math.sqrt(25));

console.log(25 ** (1 / 2));

console.log(8 ** (1 / 3));

console.log(Math.max(8, 2, '23px', 15));
console.log(Math.min(8, 2, 23, 15));
console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.random() * 6);
const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min + 1) + min);
// 0...1

// const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

console.log(randomInt(10, 30));

//Rounding

console.log(Math.trunc(23.3));
console.log(Math.round(23.5));
console.log(Math.floor(23.3));

console.log(Math.floor(-22.3));
console.log(Math.trunc(-22.3));

//Decimals

console.log((2.755).toFixed(2));

//#172-The remainder operator
console.log(5 % 2);
console.log(5 / 2);
console.log(8 / 3);
console.log(8 % 3);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

console.log();

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'Orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

// Challenge- FizzBuzz

// const fizzBuzz= (min)=> {
//   if ()

// }

//#172-Numeric seprators

const diameter = 287_460_000_000;
console.log(diameter);
const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500;
const PI = 3.1415;

console.log(Number('230_000'));

console.log(parseInt(230_000));

//#172-Working with BigInt

console.log(2 ** 53 - 1);

const bigInt = 1203812084028406021232707n;
console.log(bigInt ** 2n);

// bigInt(1203812084028406021232707n);
// console.log(100000n + 100000n);
// const num = 23;
// console.log(huge * BigInt(num));

// comparision operator

//Exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(20n == 20);

// console.log(huge + 'is REALLY big!!!');
//#175-Creating dates

//# Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('Jul 09 2022 17:46:27'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date('July 9 2021'));
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 10, 19, 15, 23, 5));
// console.log(new Date(2037, 10, 31));

// console.log(new Date(0));

//Working with dates

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());

// console.log(future.getTime());
// future.setFullYear();

// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);

// const dateString = '2019-11-01T13:15:33.035Z';

// const date1 = new Date(dateString);
// console.log(date1.getMonth());
// console.log(dateString);

//#176-Adding Dates to "Bankist"

//#177- Operations with Dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPass = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPass(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1);

//#178- Internationalizing Dates (intl)

//#179- Internationalizing Numbers (intl)
const num = 3884764.23;
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: false,
};

console.log('US:', new Intl.NumberFormat('en-CA', options).format(num));
console.log('GER:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('SYRIA:', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  'navigator.language',
  new Intl.NumberFormat(navigator.language, options).format(num)
);
console.log(navigator.language);

//#180- Timers: setTimeout and setInterval
const ingredients = ['olives', ''];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('waiting...');
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setTimeOut function
// setInterval(function () {
//   const now = new Date();
//   const hours = now.getHours();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();
//   console.log(`${hours}:${minutes}:${seconds}`);
// }, 1000);

//#180- Implementing a countdown timer

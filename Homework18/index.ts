class Rectangle {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  calculateRectangleArea(): number {
    return this.width * this.height;
  }

  calculateRectanglePerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class Circle {
  public radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  calculateCircleArea(): number {
    return Math.PI * Math.pow(this.radius, 2);
  }

  calculateCirclePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// Independent Functions

function addNumbers(a: number, b: number): number {
  return a + b;
}

function multiplyNumbers(a: number, b: number): number {
  return a * b;
}

function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterEvenNumbers(numbers: number[]): number[] {
  return numbers.filter((num) => num % 2 === 0);
}

function findMax(numbers: number[]): number {
  return Math.max(...numbers);
}

function isPalindrome(str: string): boolean {
  const cleanStr = str.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  const reversedStr = cleanStr.split("").reverse().join("");
  return cleanStr === reversedStr;
}

function calculateFactorial(n: number): number {
  if (n === 0 || n === 1) {
    return 1;
  } else {
    return n * calculateFactorial(n - 1);
  }
}

// Test Cases

// სასურველია გავაკეთოთ Rectangle და Circle კლაზები და დავუმატოთ შესაბამისი მეთოდები.

const rectangle = new Rectangle(5, 8);
const circle = new Circle(3);

const rectangleArea = rectangle.calculateRectangleArea();
const rectanglePerimeter = rectangle.calculateRectanglePerimeter();

const circleArea = circle.calculateCircleArea();
const circlePerimeter = circle.calculateCirclePerimeter();

console.log(
  `Rectangle Area: ${rectangleArea}, Perimeter: ${rectanglePerimeter}`,
);
console.log(`Circle Area: ${circleArea}, Perimeter: ${circlePerimeter}`);

const sumResult = addNumbers(5, 3);
const multiplicationResult = multiplyNumbers(4, 7);
const capitalizedString = capitalizeString("javascript is fun");
const evenNumbers = filterEvenNumbers([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(`Sum: ${sumResult}`);
console.log(`Multiplication: ${multiplicationResult}`);
console.log(`Capitalized String: ${capitalizedString}`);
console.log(`Even Numbers: ${evenNumbers}`);

const maxNumber = findMax([23, 56, 12, 89, 43]);
const isPalindromeResult = isPalindrome("A man, a plan, a canal, Panama");
const factorialResult = calculateFactorial(5);

console.log(`Max Number: ${maxNumber}`);
console.log(`Is Palindrome: ${isPalindromeResult}`);
console.log(`Factorial: ${factorialResult}`);

/* 

2. შევქმნათ კლასი BankAccount რომელსაც ექნება accountNumber,balance და transactionHistory ფროფერთები.
   კონსტრუქტორში უნდა ვიღებდეთ accountNumber და initialBalance მნიშვნელობებს.
   გარედან არუნდა იყოს შესაძლებელი accountNumber, balance და transactionHistory შეცვლა.
   კლასში უნდა გვქონდეს მეთოდები:
   getAccountInfo
   deposit - თანხის დამატება ანგარიშზე.
   withdraw - თანხის მოკლება ანგარიშიდან.
   transferFunds - გადარიცხვა სხვა BankAccount_ზე
   getTransactionHistory - აბრუნებს transactionHistory_ მასივს
   recordTransaction - transactionHistory_ში ამატებს ჩნაწერს ტრანსფერის შესახებ

   შევქმნათ მინიმუმ 2 BankAccount_ის ინსტანსი.
   გავაკეთოთ სხვადასხვა ოპერაციები.
   დავბეჯდოთ შექმნილი ექაუნთების transactionHistory.

*/

class BankAccount {
  private readonly accountNumber: string;
  private balance: number;
  private readonly transactionHistory: string[];

  constructor(accountNumber: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.transactionHistory = [];
  }

  getAccountInfo(): string {
    return `Account number is ${this.accountNumber} and balance is ${this.balance}`;
  }

  deposit(amount: number): void {
    this.balance += amount;
    this.recordTransaction(`Deposited amount: ${amount}`);
  }

  withdraw(amount: number): void {
    this.balance -= amount;
    this.recordTransaction(`Withdrawed amount: ${amount}`);
  }

  transferFunds(receiver: BankAccount, amount: number) {
    this.balance -= amount;
    receiver.balance += amount;
    this.recordTransaction(`Transfered ${amount} to ${receiver.accountNumber}`);
    receiver.recordTransaction(
      `${this.accountNumber} transfered ${amount} to you`,
    );
  }

  getTransactionHistory(): string[] {
    return [...this.transactionHistory];
  }

  private recordTransaction(transaction: string) {
    this.transactionHistory.push(transaction);
  }
}

const account1 = new BankAccount("ACC001", 1000);
const account2 = new BankAccount("ACC002", 500);

console.log(account1.getAccountInfo());
console.log(account2.getAccountInfo());

account1.deposit(200);
account2.deposit(100);

console.log(account1.getAccountInfo());
console.log(account2.getAccountInfo());

account1.withdraw(150);
account2.withdraw(50);

console.log(account1.getAccountInfo());
console.log(account2.getAccountInfo());

account1.transferFunds(account2, 300);
account2.transferFunds(account1, 100);

console.log(account1.getAccountInfo());
console.log(account2.getAccountInfo());

console.log("Account 1 transaction history:");
console.log(account1.getTransactionHistory());

console.log("Account 2 transaction history:");
console.log(account2.getTransactionHistory());

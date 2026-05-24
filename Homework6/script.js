//1
// პირველ რიგში შესრულდება კოდის სინქრონული ნაწილი,
// ანუ დაილოგება 1 და 5.
// შემდეგ პრიორიტეტი ენიჭება ფრომისებს და დაილოგება 4
// შემდეგ ვებ ეიპიაში არსებული თაიმაუთის ფუნქციები შესრულდება დილეის მიხედვით,
// ჯერ დაილოგება 3 (0მილიწამი) და შემდეგ 2 (100 მილიწამი)
// საბოლოდ: 1,5,4,3,2

//2
// ანალოგიურად ჯერ შესრულდება ლოგები თანმიმდევრულად, ანუ 1 და 5
// შემდეგ ფრომისის საშუალებით დაილოგება 3, ხოლო მასში მყოფი სეთთაიმაუთი
// გადავა შესაბამისად ვებ ეიპიაში, მაგრამ რადგან ამასობაში აქ უკვე გვაქვს
// ფრომისამდე არსებული სეთთაიმაუთი, ესენი შესრულდება თანმიმდევრულად,
// ჯერ 2, შემდეგ 4

//3
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
// await sleep(1000);

//4
function guessNum(num) {
  let interval = setInterval(() => {
    let rand = Math.floor(Math.random() * 20) + 1;
    console.log(rand);

    if (rand === num) {
      console.log("That was your number!");
      clearInterval(interval);
    }
  }, 1000);
}
// guessNum(13);

//4
function logNumbers(num, ms) {
  let interval = setInterval(() => {
    console.log(num);
    if (num > 0) {
      num--;
    } else if (num < 0) {
      num++;
    }
    if (num === 0) {
      clearInterval(interval);
    }
  }, ms);
}

// logNumbers(-13, 1000);

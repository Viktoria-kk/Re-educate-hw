//1
function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

//2
function reverseString(str) {
  return str.split("").reverse().join("");
}

//3
function countWords(sentence) {
  return sentence.trim().split(" ").length;
}

//4
function countVowels(word) {
  var vowels = "aeiou";
  var count = 0;

  for (var i = 0; i < word.length; i++) {
    if (vowels.includes(word.toLowerCase()[i])) {
      count++;
    }
  }
  return count;
}

//5
function factorial(n) {
  var result = 1;
  for (var i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

//6
function sumEven(n) {
  var sum = 0;
  for (var i = 0; i < n; i++) {
    if (i % 2 === 0) {
      sum += i;
    }
  }
  return sum;
}

//7
function grade(score) {
  if (score > 90 && score <= 100) return "A";
  else if (score > 80 && score <= 90) return "B";
  else if (score > 70 && score <= 80) return "C";
  else if (score > 60 && score <= 70) return "D";
  else if (score > 50 && score <= 60) return "E";
  else if (score <= 50 && score >= 0) return "F";
  else return "not a valid score";
}

//8
function isValidPassword(password) {
  var hasUpper = /[A-Z]/.test(password);
  var hasNumber = /[0-9]/.test(password);

  return password.length > 8 && hasUpper && hasNumber;
}

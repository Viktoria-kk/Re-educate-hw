//1

function getAbbr(string) {
  let abbr = "";
  for (let word of string.split(" ")) {
    abbr += word[0].toUpperCase();
  }
  return abbr;
}

//2

function getSumOfDigit(number) {
  let sum = 0;
  for (let i = 0; i < number.toString().length; i++) {
    sum += Number(number.toString()[i]);
  }
  return sum;
}

//მეორენაირად
function getSumOfDigit2(number) {
  let sum = 0;
  while (number > 0) {
    sum += number % 10;
    number = Math.floor(number / 10);
  }
  return sum;
}

//3
function removeDuplicates(str) {
  var result = "";

  for (var i = 0; i < str.length; i++) {
    if (!result.includes(str[i])) {
      result += str[i];
    }
  }

  return result;
}

//4
function removeSpaces(string) {
  var result = "";

  for (var i = 0; i < str.length; i++) {
    if (string[i] !== " ") {
      result += string[i];
    }
  }

  return result;
}

//5
function reverseEachWord(string) {
  var words = string.split(" ");
  var result = [];

  for (var word of words) {
    result.push(word.split("").reverse().join(""));
  }

  return result.join(" ");
}

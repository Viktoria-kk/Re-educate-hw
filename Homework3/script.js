//1
function average(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

//2
function reverseIntoArray(num) {
  return num.toString().split("").reverse().map(Number);
}

//მეორენაირად
function reverseIntoArray2(num) {
  let str = num.toString();
  let reversed = [];
  for (let i = str.length - 1; i >= 0; i--) {
    reversed.push(Number(str[i]));
  }
  return reversed;
}

//3
function uniqueElements(arr1, arr2) {
  let uniqueArray = [];
  for (let i = 0; i < arr1.length; i++) {
    if (!arr2.includes(arr1[i])) {
      uniqueArray.push(arr1[i]);
    }
  }
  return uniqueArray;
}

//4
function secondBiggest(arr) {
  return arr.sort((a, b) => b - a)[1];
}

//5
function palindromsArray(arr) {
  return arr.filter((word) => word === word.split("").reverse().join(""));
}

//6
function mostFrequent(arr) {
  var most = arr[0];
  var maxCount = 0;

  for (var i = 0; i < arr.length; i++) {
    var count = 0;

    for (var j = 0; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        count++;
      }
    }

    if (count > maxCount) {
      maxCount = count;
      most = arr[i];
    }
  }

  return most;
}

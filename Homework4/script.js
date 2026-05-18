//1
const arr = ["one", "two", "three"];
const removedArray = arr.map((word) => word.slice(0, -1));

//2
const nums = [19, 5, 42, 2, 77];
nums.sort((a, b) => a - b);
const smallestSum = nums[0] + nums[1];

//3
var sum = 0;

[10, 12, 4, 2].forEach((num) => {
  sum += num;
});

//4
const array = ["cat", "parrot", "dog", "elephant"];
const str = array
  .filter((word) => word.length > 5)
  .join("#")
  .toUpperCase();

//5
const students = [
  { name: "Ann", cls: "A", grade: 90 },
  { name: "Ben", cls: "B", grade: 75 },
  { name: "Cara", cls: "A", grade: 80 },
];
students.reduce();

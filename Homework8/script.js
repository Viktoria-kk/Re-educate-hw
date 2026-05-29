//1

// function debounce(callback, ms) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       callback(...args);
//     }, ms);
//   };
// }

// window.addEventListener(
//   "mousemove",
//   debounce((e) => {
//     console.log(e.clientX, e.clientY);
//   }, 300),
// );

// //2

// const btn = document.querySelector(".btn");
// const quoteElement = document.querySelector(".quote");
// btn.addEventListener("click", () => {
//   getQuote();
// });

// async function getQuote() {
//   const res = await fetch("https://dummyjson.com/quotes ");
//   const data = await res.json();
//   const quotes = data.quotes;

//   const randomIndex = Math.floor(Math.random() * quotes.length);
//   const quote = data.quotes[randomIndex];
//   quoteElement.textContent = `"${quote.quote}" — ${quote.author}`;
// }

//3

let currPage = 1;
const limit = 30;
const prevBtn = document.querySelector(".prevPage");
const nextBtn = document.querySelector(".nextPage");

prevBtn.addEventListener("click", () => {
  prevPage();
});

nextBtn.addEventListener("click", () => {
  nextPage();
});

function nextPage() {
  if (currPage < Math.ceil(208 / 30)) {
    currPage++;
    getUsers(currPage);
  }
}
function prevPage() {
  if (currPage > 1) {
    currPage--;
    getUsers(currPage);
  }
}
async function getUsers(page) {
  const skip = (page - 1) * limit;
  const res = await fetch(
    `https://dummyjson.com/users?skip=${skip}&limit=${limit}`,
  );
  const data = await res.json();
  console.log(data.users);
  drawUsers(data.users);
}

function drawUsers(users) {
  const container = document.querySelector(".container");
  container.innerHTML = "";

  users.forEach((user) => {
    const userDiv = document.createElement("div");
    const userName = document.createElement("h1");
    const userEmail = document.createElement("h2");

    userName.textContent = `Name: ${user.firstName}`;
    userEmail.textContent = `Email: ${user.email}`;

    userDiv.appendChild(userName);
    userDiv.appendChild(userEmail);

    userDiv.style.border = "2px solid red";

    container.appendChild(userDiv);
  });
}
getUsers(currPage);

//4

// const input = document.querySelector(".carID");
// input.addEventListener("change", (e) => {
//   getCar(e.target.value);
// });
// async function getCar(id) {
//   try {
//     const container = document.querySelector(".container");
//     container.innerHTML = "";
//     const res = await fetch(`https://myfakeapi.com/api/cars/${id}`);
//     const data = await res.json();
//     const carName = document.createElement("h1");
//     const carModel = document.createElement("h2");
//     const carYear = document.createElement("h2");
//     carName.textContent = data.Car.car;
//     carModel.textContent = data.Car.car_model;
//     carYear.textContent = data.Car.car_model_year;
//     container.appendChild(carName);
//     container.appendChild(carModel);
//     container.appendChild(carYear);
//   } catch (e) {
//     alert("Invalid ID");
//   }
// }

//1

async function fetchFiveTimes() {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch("https://jsonplaceholde.typicode.com");
    } catch (err) {
      console.log(err.message);
    }
  }
}

// fetchFiveTimes();

//2
async function firstData() {
  const [res1, res2] = await Promise.all([
    fetch("https://dummyjson.com/users"),
    fetch("https://jsonplaceholder.typicode.com/users"),
  ]);
  const data = await Promise.race([res1.json(), res2.json()]);
  console.log(data);
}

// firstData();

//3
async function productPrice() {
  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json();
  const moreThan10 = data.products.filter((product) => product.price > 10);
  console.log(moreThan10);
}
// productPrice();

//4
async function filterDevelopers() {
  const res = await fetch("https://dummyjson.com/users");
  const data = await res.json();
  const users = data.users;
  const developers = users
    .filter((user) => user.company.title == "Web Developer")
    .map((user) => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address.city,
        email: user.email,
        phone: user.phone,
      };
    });
  console.log(developers);
}

// filterDevelopers();

//5
async function logAll() {
  const [res1, res2, res3, res4] = await Promise.all([
    fetch("https://dummyjson.com/recipes"),
    fetch("https://dummyjson.com/comments"),
    fetch("https://dummyjson.com/todos"),
    fetch("https://dummyjson.com/quotes"),
  ]);
  const [data1, data2, data3, data4] = await Promise.all([
    res1.json(),
    res2.json(),
    res3.json(),
    res4.json(),
  ]);

  console.log(res1, res2, res3, res4);
  console.log(data1, data2, data3, data4);
}

logAll();

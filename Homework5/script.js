//1
function deleteProperty(object, prop) {
  delete object[prop];
  return object;
}

//2
function rankStudents(students) {
  return students
    .sort((a, b) => b.score - a.score)
    .map((student, i) => {
      return { ...student, rank: i + 1 };
    });
}

//3
function getLongestTitle(movies) {
  let longest = movies[0];

  for (let i = 1; i < movies.length; i++) {
    if (movies[i].title.length > longest.title.length) {
      longest = movies[i];
    }
  }

  return longest;
}

//4
function getAverageAge(employees) {
  const grouped = employees.reduce((acc, emp) => {
    if (!acc[emp.dept]) {
      acc[emp.dept] = { sum: 0, count: 0 };
    }

    acc[emp.dept].sum += emp.age;
    acc[emp.dept].count += 1;

    return acc;
  }, {});

  return Object.fromEntries(
    Object.entries(grouped).map(([dept, data]) => {
      return [dept, data.sum / data.count];
    }),
  );
}

//5
function countComments(comments) {
  return comments.reduce((tot, curr) => {
    if (!curr.comment.trim()) return tot;
    tot += curr.comment.trim().split(" ").length;
    return tot;
  }, 0);
}

//6
function usersBySalaryDesc(users) {
  const grouped = users.reduce((prev, curr) => {
    if (!prev[curr.department]) {
      prev[curr.department] = [];
    }
    prev[curr.department].push(curr);

    return prev;
  }, {});

  for (let dept in grouped) {
    grouped[dept].sort((a, b) => b.salary - a.salary);
  }

  return grouped;
}

//7
function allPrice(cart) {
  return cart.reduce((tot, curr) => {
    tot += (curr.price * curr.quantity * (100 - curr.discountPercent)) / 100;
    return tot;
  }, 0);
}

//8
function arrToObject(users) {
  const result = {};

  for (let user of users) {
    result[user.id] = user;
  }

  return result;
}

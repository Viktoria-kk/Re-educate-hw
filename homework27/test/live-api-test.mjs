import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = 'StrongPass123!';
const users = [
  {
    firstName: 'Live',
    lastName: 'Male',
    email: `live-m-${unique}@example.com`,
    phoneNumber: `555-m-${unique}`,
    gender: 'm',
    age: 20,
    password,
  },
  {
    firstName: 'Live',
    lastName: 'Female',
    email: `live-f-${unique}@example.com`,
    phoneNumber: `555-f-${unique}`,
    gender: 'f',
    age: 40,
    password,
  },
];

const sessions = [];
const createdExpenses = [];
const createdProducts = [];
const results = [];

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body && { 'content-type': 'application/json' }),
      ...(token && { authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let data = text;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Keep non-JSON responses available for assertion messages.
    }
  }
  return { status: response.status, data };
}

function expectStatus(response, status, label) {
  assert.equal(
    response.status,
    status,
    `${label}: expected ${status}, got ${response.status}: ${JSON.stringify(response.data)}`,
  );
  results.push(`${label}: ${status}`);
}

function statisticMap(rows) {
  return new Map(rows.map((row) => [row.category, row]));
}

function numberOrZero(row, key) {
  return row?.[key] ?? 0;
}

async function cleanup() {
  // Deleting a user cascades to that user's expenses and products.
  for (const session of sessions) {
    await request('DELETE', `/users/${session.id}`, { token: session.token });
  }
}

try {
  const unauthorized = await request('GET', '/expenses/statistic');
  expectStatus(unauthorized, 401, 'JWT guard blocks anonymous statistics request');

  const invalidToken = await request('GET', '/auth/me', {
    token: 'invalid.jwt.token',
  });
  expectStatus(invalidToken, 401, 'invalid JWT is rejected');

  for (const user of users) {
    const registration = await request('POST', '/auth/register', { body: user });
    expectStatus(registration, 201, `register ${user.gender} user`);
    assert.equal(typeof registration.data.accessToken, 'string');

    const login = await request('POST', '/auth/login', {
      body: { email: user.email, password },
    });
    expectStatus(login, 201, `login ${user.gender} user`);

    const me = await request('GET', '/auth/me', {
      token: login.data.accessToken,
    });
    expectStatus(me, 200, `read ${user.gender} profile`);
    assert.equal(me.data.age, user.age);
    assert.equal(me.data.isActive, true);
    sessions.push({ id: me.data._id, token: login.data.accessToken, user });
  }

  const [maleSession, femaleSession] = sessions;

  const wrongPassword = await request('POST', '/auth/login', {
    body: { email: maleSession.user.email, password: 'WrongPass123!' },
  });
  expectStatus(wrongPassword, 401, 'wrong password is rejected');

  const duplicateRegistration = await request('POST', '/auth/register', {
    body: maleSession.user,
  });
  expectStatus(duplicateRegistration, 400, 'duplicate email is rejected');

  const allUsers = await request('GET', '/users?take=30', {
    token: maleSession.token,
  });
  expectStatus(allUsers, 200, 'list users');
  assert.ok(allUsers.data.some((user) => user._id === maleSession.id));

  const filteredUsers = await request(
    'GET',
    `/users?gender=f&email=${encodeURIComponent(femaleSession.user.email)}`,
    { token: maleSession.token },
  );
  expectStatus(filteredUsers, 200, 'filter users by gender and email');
  assert.equal(filteredUsers.data.length, 1);
  assert.equal(filteredUsers.data[0]._id, femaleSession.id);

  const oneUser = await request('GET', `/users/${maleSession.id}`, {
    token: maleSession.token,
  });
  expectStatus(oneUser, 200, 'read user by id');

  const invalidUserId = await request('GET', '/users/not-an-object-id', {
    token: maleSession.token,
  });
  expectStatus(invalidUserId, 400, 'reject invalid user object id');

  const invalidPagination = await request('GET', '/users?take=31', {
    token: maleSession.token,
  });
  expectStatus(invalidPagination, 400, 'users pagination upper bound');

  const forbiddenUserUpdate = await request('PATCH', `/users/${femaleSession.id}`, {
    token: maleSession.token,
    body: { firstName: 'Forbidden' },
  });
  expectStatus(forbiddenUserUpdate, 403, 'cannot update another user');

  const forbiddenUserDelete = await request('DELETE', `/users/${femaleSession.id}`, {
    token: maleSession.token,
  });
  expectStatus(forbiddenUserDelete, 403, 'cannot delete another user');

  const deactivated = await request('PATCH', `/users/${maleSession.id}`, {
    token: maleSession.token,
    body: { isActive: false },
  });
  expectStatus(deactivated, 200, 'update isActive');
  assert.equal(deactivated.data.isActive, false);

  const userStatistics = await request('GET', '/users/statistic', {
    token: maleSession.token,
  });
  expectStatus(userStatistics, 200, 'gender/average-age statistics');
  for (const session of sessions) {
    const group = userStatistics.data.find(
      (item) => item.gender === session.user.gender,
    );
    assert.ok(group, `missing ${session.user.gender} gender group`);
    assert.equal(typeof group.averageAge, 'number');
    assert.ok(group.totalUsers >= 1);
  }

  const productBody = (index) => ({
    name: `Live product ${index}`,
    category: 'test',
    description: 'Live API regression test product',
    price: 10 + index,
    quantity: index,
  });

  const anonymousProducts = await request('GET', '/products');
  expectStatus(anonymousProducts, 401, 'products require JWT');

  for (let index = 1; index <= 4; index += 1) {
    const response = await request('POST', '/products', {
      token: maleSession.token,
      body: productBody(index),
    });
    expectStatus(response, 201, `create product ${index}`);
    createdProducts.push(response.data._id);
  }

  const invalidProduct = await request('POST', '/products', {
    token: maleSession.token,
    body: { name: 'Incomplete product' },
  });
  expectStatus(invalidProduct, 400, 'product DTO validation');

  const productWriteLimited = await request('POST', '/products', {
    token: maleSession.token,
    body: productBody(6),
  });
  expectStatus(productWriteLimited, 429, 'strict write rate limit after 5 requests');

  const products = await request('GET', '/products', { token: maleSession.token });
  expectStatus(products, 200, 'list own products');
  assert.ok(createdProducts.every((id) => products.data.some((item) => item._id === id)));

  const oneProduct = await request('GET', `/products/${createdProducts[0]}`, {
    token: maleSession.token,
  });
  expectStatus(oneProduct, 200, 'read own product');

  const hiddenProduct = await request('GET', `/products/${createdProducts[0]}`, {
    token: femaleSession.token,
  });
  expectStatus(hiddenProduct, 404, 'cannot read another user product');

  const invalidProductId = await request('GET', '/products/not-an-object-id', {
    token: maleSession.token,
  });
  expectStatus(invalidProductId, 400, 'reject invalid product object id');

  const forbiddenProductUpdate = await request('PATCH', `/products/${createdProducts[0]}`, {
    token: femaleSession.token,
    body: { price: 500 },
  });
  expectStatus(forbiddenProductUpdate, 404, 'cannot update another user product');

  const updatedProduct = await request('PATCH', `/products/${createdProducts[0]}`, {
    token: maleSession.token,
    body: { price: 25 },
  });
  expectStatus(updatedProduct, 200, 'update own product');
  assert.equal(updatedProduct.data.price, 25);

  const forbiddenProductDelete = await request('DELETE', `/products/${createdProducts[1]}`, {
    token: femaleSession.token,
  });
  expectStatus(forbiddenProductDelete, 404, 'cannot delete another user product');

  const deletedProduct = await request('DELETE', `/products/${createdProducts[0]}`, {
    token: maleSession.token,
  });
  expectStatus(deletedProduct, 200, 'delete own product');

  const beforeStatisticsResponse = await request('GET', '/expenses/statistic', {
    token: maleSession.token,
  });
  expectStatus(beforeStatisticsResponse, 200, 'expense statistics baseline');
  const beforeStatistics = statisticMap(beforeStatisticsResponse.data);

  const expenseInputs = [
    [maleSession, { category: 'food', productName: 'Lunch', quantity: 2, price: 10 }],
    [maleSession, { category: 'food', productName: 'Dinner', quantity: 1, price: 30 }],
    [maleSession, { category: 'travel', productName: 'Train', quantity: 1, price: 100 }],
    [femaleSession, { category: 'food', productName: 'Snack', quantity: 3, price: 5 }],
    [femaleSession, { category: 'sport', productName: 'Gym', quantity: 2, price: 25 }],
  ];

  for (const [session, expense] of expenseInputs) {
    const response = await request('POST', '/expenses', {
      token: session.token,
      body: expense,
    });
    expectStatus(response, 201, `create ${expense.productName} expense`);
    createdExpenses.push({ id: response.data._id, ownerId: session.id });
  }

  const ownExpenses = await request('GET', '/expenses?category=food', {
    token: maleSession.token,
  });
  expectStatus(ownExpenses, 200, 'list and filter own expenses');
  assert.equal(ownExpenses.data.length, 2);

  const oneExpense = await request('GET', `/expenses/${createdExpenses[0].id}`, {
    token: maleSession.token,
  });
  expectStatus(oneExpense, 200, 'read own expense');

  const hiddenExpense = await request('GET', `/expenses/${createdExpenses[0].id}`, {
    token: femaleSession.token,
  });
  expectStatus(hiddenExpense, 404, 'cannot read another user expense');

  const invalidExpenseId = await request('GET', '/expenses/not-an-object-id', {
    token: maleSession.token,
  });
  expectStatus(invalidExpenseId, 400, 'reject invalid expense object id');

  const forbiddenUpdate = await request(
    'PATCH',
    `/expenses/${createdExpenses.at(-1).id}`,
    { token: maleSession.token, body: { price: 999 } },
  );
  expectStatus(forbiddenUpdate, 404, 'cannot update another user expense');

  const updatedExpense = await request('PATCH', `/expenses/${createdExpenses[0].id}`, {
    token: maleSession.token,
    body: { productName: 'Updated lunch' },
  });
  expectStatus(updatedExpense, 200, 'update own expense');
  assert.equal(updatedExpense.data.productName, 'Updated lunch');

  const afterStatisticsResponse = await request('GET', '/expenses/statistic', {
    token: maleSession.token,
  });
  expectStatus(afterStatisticsResponse, 200, 'expense statistics after inserts');
  const afterStatistics = statisticMap(afterStatisticsResponse.data);
  const expectedDeltas = {
    food: { totalExpense: 65, totalItems: 6, expenseCount: 3 },
    travel: { totalExpense: 100, totalItems: 1, expenseCount: 1 },
    sport: { totalExpense: 50, totalItems: 2, expenseCount: 1 },
  };

  for (const [category, expected] of Object.entries(expectedDeltas)) {
    const before = beforeStatistics.get(category);
    const after = afterStatistics.get(category);
    assert.ok(after, `missing ${category} category`);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(numberOrZero(after, key) - numberOrZero(before, key), value);
    }
    assert.equal(
      after.expenses.length - (before?.expenses.length ?? 0),
      expected.expenseCount,
    );
  }
  results.push('category totals, item counts, expense counts and arrays: exact deltas');

  const topSpenders = await request('GET', '/expenses/top-spenders?limit=100', {
    token: maleSession.token,
  });
  expectStatus(topSpenders, 200, 'top spenders');
  const maleTotal = topSpenders.data.find((item) => item.userId === maleSession.id);
  const femaleTotal = topSpenders.data.find(
    (item) => item.userId === femaleSession.id,
  );
  assert.deepEqual(
    {
      totalSpent: maleTotal?.totalSpent,
      totalItems: maleTotal?.totalItems,
      expenseCount: maleTotal?.expenseCount,
    },
    { totalSpent: 150, totalItems: 4, expenseCount: 3 },
  );
  assert.deepEqual(
    {
      totalSpent: femaleTotal?.totalSpent,
      totalItems: femaleTotal?.totalItems,
      expenseCount: femaleTotal?.expenseCount,
    },
    { totalSpent: 65, totalItems: 5, expenseCount: 2 },
  );
  results.push('top spender totals: male=150, female=65');

  const invalidLimit = await request('GET', '/expenses/top-spenders?limit=101', {
    token: maleSession.token,
  });
  expectStatus(invalidLimit, 400, 'top spenders upper-limit validation');

  const forbiddenExpenseDelete = await request(
    'DELETE',
    `/expenses/${createdExpenses.at(-1).id}`,
    { token: maleSession.token },
  );
  expectStatus(forbiddenExpenseDelete, 404, 'cannot delete another user expense');

  const deletedExpense = await request('DELETE', `/expenses/${createdExpenses[0].id}`, {
    token: maleSession.token,
  });
  expectStatus(deletedExpense, 200, 'delete own expense');

  for (let requestNumber = 1; requestNumber <= 30; requestNumber += 1) {
    const root = await request('GET', '/');
    expectStatus(root, 200, `global rate request ${requestNumber}/30`);
  }
  const globallyLimited = await request('GET', '/');
  expectStatus(globallyLimited, 429, 'global rate limit after 30 requests');

  console.log('\nLIVE API TEST PASSED');
  for (const result of results) console.log(`- ${result}`);
} finally {
  await cleanup();
}

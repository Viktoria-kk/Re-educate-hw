//1
class Todo {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.isDone = false;
    this.createdAt = new Date();
  }
}
class TodoList {
  todos = [];
  i = 1;
  add(title) {
    const todo = new Todo(this.i++, title);
    this.todos.push(todo);
    return todo;
  }
  delete(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }
  checkActiveTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.isDone = true;
    }
  }
  getAllTodos(filter = {}) {
    if (filter.active === true) {
      return this.todos.filter((todo) => !todo.isDone);
    }

    if (filter.active === false) {
      return this.todos.filter((todo) => todo.isDone);
    }

    return this.todos;
  }
}

//2
class Product {
  constructor(id, name, price, quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }
}
class ShoppingCart {
  items = [];
  i = 1;
  addToCart(name, price, quantity) {
    const product = new Product(this.i++, name, price, quantity);
    this.items.push(product);
  }
  removeFromCart(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
  calculateTotalPrice() {
    return this.items.reduce(
      (tot, curr) => tot + curr.price * curr.quantity,
      0,
    );
  }
  updateItem(id, price) {
    const item = this.items.find((item) => item.id === id);
    if (item) {
      item.price = price;
    }
  }
}

//3
class Book {
  constructor(name, author, year) {
    this.name = name;
    this.author = author;
    this.year = year;
  }
}
class Library {
  books = [];
  addBook(name, author, year) {
    const book = new Book(name, author, year);
    this.books.push(book);
  }
  removeBook(name) {
    this.books = this.books.filter((book) => book.name !== name);
  }
  listBooks(sort) {
    if (sort === "year") {
      return this.books.sort((a, b) => a.year - b.year);
    }
    return this.books;
  }
}

//4
class Contact {
  constructor(name, phone, email) {
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
}
class ContactManager {
  constructor() {
    this.contacts = [];
  }

  addNewContact(name, phone, email) {
    for (let i = 0; i < this.contacts.length; i++) {
      const c = this.contacts[i];

      if (c.email === email || c.phone === phone) {
        console.log("Contact with same email or phone already exists!");
        return;
      }
    }
    const contact = new Contact(name, phone, email);
    this.contacts.push(contact);
  }

  viewAllContacts() {
    return this.contacts;
  }

  updatePhone(email, newPhone) {
    const contact = this.contacts.find((c) => c.email === email);

    if (!contact) {
      console.log("Contact not found!");
      return;
    }

    for (let i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i].phone === newPhone) {
        console.log("This phone number is already taken!");
        return;
      }
    }

    contact.phone = newPhone;
  }

  deleteContact(email) {
    this.contacts = this.contacts.filter((c) => c.email !== email);
  }
}

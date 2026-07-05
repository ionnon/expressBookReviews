const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

// Internal data endpoint used by Axios-based route implementations
public_users.get('/internal/books', function (req, res) {
  return res.json(books);
});

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const userExists = users.some(user => user.username === username);

    if (!userExists) {
      users.push({ username: username, password: password });
      return res.status(201).json({ message: "User successfully registered. Now you can login" });
    }

    return res.status(409).json({ message: "User already exists!" });
  }

  return res.status(400).json({ message: "Unable to register user. Please provide both username and password." });
});

// Helper function: Get all books using async/await with Axios
const getAllBooksUsingAxios = async (req) => {
  try {
    const response = await axios.get(`${getBaseUrl(req)}/internal/books`);
    return response.data;
  } catch (error) {
    return books;
  }
};

// Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooksUsingAxios(req);
    return res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const allBooks = await getAllBooksUsingAxios(req);

    if (allBooks[isbn]) {
      return res.json(allBooks[isbn]);
    }

    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});

// Get books based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const allBooks = await getAllBooksUsingAxios(req);

    const booksByAuthor = Object.values(allBooks).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
      return res.json(booksByAuthor);
    }

    return res.status(404).json({ message: "No books found by this author" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const allBooks = await getAllBooksUsingAxios(req);

    const booksByTitle = Object.values(allBooks).filter(book => book.title === title);

    if (booksByTitle.length > 0) {
      return res.json(booksByTitle);
    }

    return res.status(404).json({ message: "No books found with this title" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

// Get book reviews
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const allBooks = await getAllBooksUsingAxios(req);

    if (allBooks[isbn] && allBooks[isbn].reviews) {
      return res.json(allBooks[isbn].reviews);
    }

    return res.status(404).json({ message: "Reviews not found for this book" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book review" });
  }
});

module.exports.general = public_users;

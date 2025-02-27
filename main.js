const STORAGE_KEY = 'BOOKSHELF_APPS';
let bookCollection = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    addNewBook();
  });

  if (isLocalStorageAvailable()) {
    loadBooksFromLocalStorage();
  }
});

function isLocalStorageAvailable() {
  return typeof(Storage) !== 'undefined';
}

function saveBooksToLocalStorage() {
  const serializedBooks = JSON.stringify(bookCollection);
  localStorage.setItem(STORAGE_KEY, serializedBooks);
}

function loadBooksFromLocalStorage() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const parsedData = JSON.parse(storedData);

  if (parsedData !== null) {
    bookCollection = parsedData;
  }

  displayBooks();
}

function createUniqueId() {
  return +new Date();
}

function createBookObject(id, title, author, year, isComplete) { // Perbaikan di sini
  return {
    id,
    title,
    author,
    year,
    isComplete, // Perbaikan di sini
  };
}

function addNewBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked; // Perbaikan di sini

  const newId = createUniqueId();
  const newBook = createBookObject(newId, title, author, year, isComplete); // Perbaikan di sini
  bookCollection.push(newBook);

  document.getElementById('bookForm').reset();

  saveBooksToLocalStorage();
  displayBooks();
}

function displayBooks() {
  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  for (const book of bookCollection) {
    const bookElement = createBookElement(book);

    if (!book.isComplete) { // Perbaikan di sini
      incompleteList.append(bookElement);
    } else {
      completeList.append(bookElement);
    }
  }
}

function markBookAsCompleted(bookId) {
  const targetBook = findBookById(bookId);

  if (targetBook == null) return;

  targetBook.isComplete = true; // Perbaikan di sini
  saveBooksToLocalStorage();
  displayBooks();
}

function revertBookFromCompleted(bookId) {
  const targetBook = findBookById(bookId);

  if (targetBook == null) return;

  targetBook.isComplete = false; // Perbaikan di sini
  saveBooksToLocalStorage();
  displayBooks();
}

function deleteBook(bookId) {
  const bookIndex = findBookIndexById(bookId);

  if (bookIndex === -1) return;

  bookCollection.splice(bookIndex, 1);
  saveBooksToLocalStorage();
  displayBooks();
}

function findBookById(bookId) {
  for (const book of bookCollection) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndexById(bookId) {
  for (let index in bookCollection) {
    if (bookCollection[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

document.getElementById('searchBook').addEventListener('submit', (event) => {
  event.preventDefault();
  searchForBooks();
});

function searchForBooks() {
  const searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();
  const filteredBooks = bookCollection.filter(book => book.title.toLowerCase().includes(searchQuery));
  displayBooks(filteredBooks);
}

function displayBooks(filteredBooks = bookCollection) {
  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');

  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  for (const book of filteredBooks) {
    const bookElement = createBookElement(book);

    if (!book.isComplete) { // Perbaikan di sini
      incompleteList.append(bookElement);
    } else {
      completeList.append(bookElement);
    }
  }
}

function createBookElement(book) {
  const titleElement = document.createElement('h3');
  titleElement.innerText = book.title;
  titleElement.setAttribute('data-testid', 'bookItemTitle');

  const authorElement = document.createElement('p');
  authorElement.innerText = `Penulis: ${book.author}`;
  authorElement.setAttribute('data-testid', 'bookItemAuthor');

  const yearElement = document.createElement('p');
  yearElement.innerText = `Tahun: ${book.year}`;
  yearElement.setAttribute('data-testid', 'bookItemYear');

  const bookContainer = document.createElement('div');
  bookContainer.classList.add('book-item');
  bookContainer.setAttribute('data-bookid', book.id);
  bookContainer.setAttribute('data-testid', 'bookItem');

  bookContainer.append(titleElement, authorElement, yearElement);

  const actionContainer = document.createElement('div');

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Hapus Buku';
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.addEventListener('click', () => {
    deleteBook(book.id);
  });

  const editBtn = document.createElement('button');
  editBtn.innerText = 'Edit Buku';
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.addEventListener('click', () => {
    openEditBookForm(book.id);
  });

  const toggleBtn = document.createElement('button');
  toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  if (book.isComplete) { // Perbaikan di sini
    toggleBtn.innerText = 'Belum Selesai Dibaca';
    toggleBtn.addEventListener('click', () => {
      revertBookFromCompleted(book.id);
    });
  } else {
    toggleBtn.innerText = 'Selesai Dibaca';
    toggleBtn.addEventListener('click', () => {
      markBookAsCompleted(book.id);
    });
  }

  actionContainer.append(toggleBtn, deleteBtn, editBtn);
  bookContainer.append(actionContainer);

  return bookContainer;
}

function openEditBookForm(bookId) {
  const book = findBookById(bookId);
  if (!book) return;

  document.getElementById('bookFormTitle').value = book.title;
  document.getElementById('bookFormAuthor').value = book.author;
  document.getElementById('bookFormYear').value = book.year;
  document.getElementById('bookFormIsComplete').checked = book.isComplete; // Perbaikan di sini

  const form = document.getElementById('bookForm');
  form.removeEventListener('submit', addNewBook);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateBookDetails(bookId);
  });
}

function updateBookDetails(bookId) {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked; // Perbaikan di sini

  const book = findBookById(bookId);
  if (!book) return;

  book.title = title;
  book.author = author;
  book.year = year;
  book.isComplete = isComplete; // Perbaikan di sini

  saveBooksToLocalStorage();
  displayBooks();

  document.getElementById('bookForm').reset();
  const form = document.getElementById('bookForm');
  form.removeEventListener('submit', updateBookDetails);
  form.addEventListener('submit', addNewBook);
}

document.getElementById('bookFormIsComplete').addEventListener('change', function() {
  const submitButtonText = document.getElementById('bookFormSubmit').querySelector('span');
  if (this.checked) {
    submitButtonText.innerText = 'Selesai dibaca';
  } else {
    submitButtonText.innerText = 'Belum selesai dibaca';
  }
});
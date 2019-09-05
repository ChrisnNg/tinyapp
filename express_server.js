const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID'},
  "9sm5xK": { longURL: "http://www.google.com", userID: 'user2RandomID'}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Create
app.post("/urls", (req, res) => {//prefix longURL with http:// if not present, and adds new key and value into urlDatabase
  let longURL = "";
  !req.body.longURL.startsWith('http://') ? longURL = 'http://' + req.body.longURL : longURL = req.body.longURL;
  let shortURL = generateRandomString();
  const userID = req.cookies['user_id'];
  console.log(userID);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  if (!req.body.email && !req.body.password) {
    res.sendStatus(400);
  }
  if (emailIsUnique(req.body.email)) {
    users[id] = {
      id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', id);
    res.redirect(301, "/urls");
  } else res.sendStatus(400);
});
// Read
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies['user_id']]) {
    let templateVars = {'user_id': users[req.cookies['user_id']]};
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userObject = users[req.cookies['user_id']];
  let templateVars = {
    urls: urlDatabase,
    'user_id': users[req.cookies['user_id']]
  };
  if (userObject) {
    templateVars['urls'] = urlsForUser(userObject.id);
  }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.cookies['user_id']];
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], 'user_id': users[req.cookies['user_id']], 'url_id':urlDatabase[req.params.shortURL]['userID']};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(307, longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    'user_id': users[req.cookies['user_id']]
  };
  res.render("account_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { 'user_id': users[req.cookies['user_id']] };
  res.render("account_login", templateVars);
});

app.post("/login", (req, res) => {
  if (emailLookUp(req.body.email).email === req.body.email && emailLookUp(req.body.email).password === req.body.password) {
    res.cookie('user_id', emailLookUp(req.body.email).id);
    res.redirect(301, "//localhost:8080/urls/");
  } else res.sendStatus(403);
});

// Update
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(301, "//localhost:8080/urls/");
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(301, "//localhost:8080/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(301, "//localhost:8080/urls/");
});

const getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

const generateRandomString = function() {
  let randomString = "";
  let arrayCharc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  let i = 0;

  while (i < 6) {
    randomString += arrayCharc[getRandomInt(61)];
    i++;
  }
  return randomString;
};

const emailIsUnique = function(email) {
  for (let ids in users) {
    if (users[ids]['email'] === email) {
      console.log(email + " already exists within the database");
      return false;
    }
  }
  return true;
};

const emailLookUp = function(email) {
  for (let ids in users) {
    if (users[ids]['email'] === email) {
      return users[ids];
    }
  } console.log("Email unable to be found");
  return false;
};

const urlsForUser = function(id) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL]['userID']) {
      userUrls[shortURL] = urlDatabase[shortURL]['longURL'];
      console.log(userUrls);
    }
  }
  return userUrls;
};
urlsForUser('user2RandomID');


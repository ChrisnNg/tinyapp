const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp']
}));

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
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// !Create
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {//prefix longURL with http:// if not present, and adds new key and value into urlDatabase
  let longURL = "";
  !req.body.longURL.startsWith('http://') ? longURL = 'http://' + req.body.longURL : longURL = req.body.longURL;
  let shortURL = generateRandomString();
  const userID = req.session.user_id;
  console.log(userID);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  if (!req.body.email && !req.body.password) {
    res.sendStatus(400);
  }
  if (!getUserByEmail(req.body.email, users)) {
    users[id] = {
      id,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(users[id]);
    req.session.user_id = id;
    res.redirect(301, "/urls");
  } else res.sendStatus(400);
});

// !Read

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = {'user_id': users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userObject = users[req.session.user_id];
  let templateVars = {
    urls: urlDatabase,
    'user_id': users[req.session.user_id]
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
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], 'user_id': users[req.session.user_id], 'url_id':urlDatabase[req.params.shortURL]['userID']};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(307, longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    'user_id': users[req.session.user_id]
  };
  res.render("account_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { 'user_id': users[req.session.user_id] };
  res.render("account_login", templateVars);
});

// !Update
app.post("/login", (req, res) => {
  if (getUserByEmail(req.body.email, users).email === req.body.email && bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email, users).hashedPassword)) {
    req.session.user_id = getUserByEmail(req.body.email, users).id;
    res.redirect(301, "//localhost:8080/urls/");
  } else res.sendStatus(403);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]['userID']) {
    urlDatabase[shortURL] = { longURL: newLongURL, userID };
    res.redirect(301, "//localhost:8080/urls/");
  } else res.sendStatus(401);
});

//!Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]['userID']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(301, "//localhost:8080/urls/");
  } else res.sendStatus(401);

});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
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


const urlsForUser = function(id) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL]['userID']) {
      userUrls[shortURL] = urlDatabase[shortURL]['longURL'];
    }
  }
  return userUrls;
};
urlsForUser('user2RandomID');
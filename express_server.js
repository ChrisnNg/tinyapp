const express = require("express");
const app = express();
const PORT = process.env.YOUR_PORT || process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = require("./helpers");

app.use(
  cookieSession({
    name: "session",
    keys: ["tinyapp"]
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// !Create
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  //prefix longURL with http:// if not present, and adds new key and value into urlDatabase
  let longURL = "";
  !req.body.longURL.startsWith("http://")
    ? (longURL = "http://" + req.body.longURL)
    : (longURL = req.body.longURL);
  let shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  let templateVars = {
    user_id: users[req.session.user_id],
    emptyvalue: false
  };
  if (req.body.email && req.body.password.length > 0) {
    if (!getUserByEmail(req.body.email, users)) {
      users[id] = {
        id,
        email: req.body.email,
        hashedPassword: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = id;
      res.redirect(301, "/urls");
    } else {
      res.render("account_register_error", templateVars);
    }
  } else {
    templateVars["emptyvalue"] = true;
    res.render("account_register_error", templateVars);
  }
});

// !Read

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user_id: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userObject = users[req.session.user_id];
  let templateVars = {
    urls: urlDatabase,
    user_id: users[req.session.user_id]
  };
  if (userObject) {
    templateVars["urls"] = urlsForUser(userObject.id, urlDatabase);
  }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let willRender = true;
  for (let url in urlDatabase) {
    if (url === shortURL) {
      let templateVars = {
        shortURL,
        longURL: urlDatabase[shortURL]["longURL"],
        user_id: users[req.session.user_id],
        url_id: urlDatabase[shortURL]["userID"]
      };
      res.render("urls_show", templateVars);
      willRender = false;
      break;
    }
  }
  if (willRender) {
    let templateVars = { user_id: users[req.session.user_id] };
    res.render("errorpage", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let willRender = true;

  for (let url in urlDatabase) {
    if (url === shortURL) {
      let longURL = urlDatabase[shortURL]["longURL"];
      res.redirect(307, longURL);
    }
  }
  if (willRender) {
    let templateVars = { user_id: users[req.session.user_id] };
    res.render("errorpage", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  let templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("account_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  let templateVars = {
    user_id: users[req.session.user_id],
    loginFailed: false
  };
  res.render("account_login", templateVars);
});

// !Update
app.post("/login", (req, res) => {
  if (
    getUserByEmail(req.body.email, users).email === req.body.email &&
    bcrypt.compareSync(
      req.body.password,
      getUserByEmail(req.body.email, users).hashedPassword
    )
  ) {
    req.session.user_id = getUserByEmail(req.body.email, users).id;
    res.redirect(301, "/urls");
  } else {
    let templateVars = {
      user_id: users[req.session.user_id],
      loginFailed: true
    };
    res.render("account_login", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    urlDatabase[shortURL] = { longURL: newLongURL, userID };
    res.redirect(301, "/urls");
  } else res.sendStatus(401);
});

//!Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(301, "/urls");
  } else res.sendStatus(401);
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(301, "/urls");
});

const express = require("express");
const cookies = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookies());

function generateRandomString() {
  const valuesForString = '0123456789abcdefghijklmnopqrstuvwxyz';
  let returnString = '';
  for (let i = 0; i < 6; i++) {
    let ranNum = Math.floor((Math.random() * 36));
    returnString += valuesForString[ranNum];
  }
  return returnString;
};

function checkRegistered(req) {
  let username = req.cookies["user_id"];
  if (!username || !users[username]) {
    return false
  }
  return true;
};

function emailChecker(email) {
  for (keys in users) {
    if(users[keys].email === email) {
      return users[keys];
    }
  }
  return null;
}

function urlsForUser(id) {
  let urls = {};
  
  for(keys in urlDatabase) {
    if(urlDatabase[keys].userID === id) {
      urls[keys] = {longURL: urlDatabase[keys].longURL};
    }
  }

  return urls;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i23LyXR: {
    longURL: "https://neopets.com",
    userID: "bK67L3",
  }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "a",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/urls", (req, res) => {
  const registered = checkRegistered(req);
  const userID = req.cookies["user_id"];
  const urlObject = urlsForUser(userID);
  const templateVars = { urls: urlObject, users: users, registered: registered, userID: userID };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const registered = checkRegistered(req);
  if(registered === false) {
    res.redirect('/urls/login');
  }
  const userID = req.cookies["user_id"];
  const templateVars = { users: users, registered: registered, userID: userID };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const registered = checkRegistered(req);
  if(registered === true) {
    res.redirect('/urls');
  }
  const userID = req.cookies["user_id"];
  const templateVars = { users: users, registered: registered, userID: userID }
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const registered = checkRegistered(req);
  if(registered === true) {
    res.redirect('/urls');
  }
  const userID = req.cookies["user_id"];
  const templateVars = { users: users, registered: registered, userID: userID }
  res.render("urls_login", templateVars)
});

app.get("/urls/:id", (req, res) => {
  const registered = checkRegistered(req);
  if (registered) {
    const userID = req.cookies["user_id"];
    if (userID === urlDatabase[req.params.id].userID) {
      for (keys in urlDatabase) {
        if(req.params.id === keys) {
          const templateVars = { users: users, registered: registered, userID: userID, id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
          res.render("urls_show", templateVars);
        }
      }
      res.sendStatus(res.statusCode = 404);
    }
    res.sendStatus(res.statusCode = 404);
  }
  res.sendStatus(res.statusCode = 400);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const url = req.body.longURL;
  const newID = generateRandomString();
  const registered = checkRegistered(req);
  if (registered === false) {
    res.sendStatus(res.statusCode = 404);
  } else {
    const userID = req.cookies["user_id"];
    urlDatabase[newID] = {longURL: url, userID: userID};
    templateVars = { users: users, registered: registered, userID: userID, id: newID, longURL: url };
  }
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  } else {
    res.sendStatus(res.statusCode = 404);
  }
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/`);
});

app.post("/urls/:id/edit", (req, res) =>{
  const userID = req.cookies["user_id"];
  if (userID === urlDatabase[req.params.id].userID) {
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.sendStatus(res.statusCode = 404);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls/login`);
});

app.post("/urls/register", (req, res) => {
  const id = generateRandomString();
  if (req.body.email === "" || req.body.password === "" || emailChecker(req.body.email) !== null) {
    res.sendStatus(res.statusCode = 400);
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id: id, email: req.body.email, password: hashedPassword };
  res.cookie('user_id', id);
  res.redirect('/urls/');
});

app.post("/urls/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(res.statusCode = 400);
  }
  const userObject = emailChecker(req.body.email);
  if (userObject) {
    if (bcrypt.compareSync(req.body.password, userObject.password)) {
      res.cookie('user_id', userObject.id);
      res.redirect('/urls');
    } else {
      res.sendStatus(res.statusCode = 403);
    }
  } else {
    res.sendStatus(res.statusCode = 403);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
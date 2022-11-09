const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const helpers = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['my secret key'],
  maxAge: 24 * 60 * 60 * 1000
}));

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

// Password Tests
const passwordForUserOne = 'a';
const hashedPasswordForUserOne = bcrypt.hashSync(passwordForUserOne, 10);

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: hashedPasswordForUserOne,
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/urls", (req, res) => {
  const registered = helpers.checkRegistered(req, users);
  const userID = req.session.user_id
  const urlObject = helpers.urlsForUser(userID, urlDatabase);
  const templateVars = { urls: urlObject, users: users, registered: registered, userID: userID };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const registered = helpers.checkRegistered(req, users);
  if(registered === false) { // Redirect user if not logged in
    res.redirect('/login');
  } else {
    const userID = req.session.user_id;
    const templateVars = { users: users, registered: registered, userID: userID };
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  const registered = helpers.checkRegistered(req, users);
  if(registered === true) { // Redirect user if already logged in
    res.redirect('/urls');
  }
  const userID = req.session.user_id;
  const templateVars = { users: users, registered: registered, userID: userID }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const registered = helpers.checkRegistered(req, users);
  if(registered === true) { // Redirect user if already logged in
    res.redirect('/urls');
  }
  const userID = req.session.user_id;
  const templateVars = { users: users, registered: registered, userID: userID }
  res.render("urls_login", templateVars)
});

app.get("/urls/:id", (req, res) => {
  const registered = helpers.checkRegistered(req, users);
  if (registered) {
    const userID = req.session.user_id;
    if (userID === urlDatabase[req.params.id].userID) { // Check user is in database
      for (keys in urlDatabase) {
        if(req.params.id === keys) { // Search through keys to check that ID matches URLs ID
          const templateVars = { users: users, registered: registered, userID: userID, id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
          res.render("urls_show", templateVars);
        }
      }
      res.status(404).send('This URL doesn\'t belong to logged in user');
    } else {
      res.status(404).send('This URL doesn\'t belong to logged in user');
    }
  } else {
    res.status(400).send('You must be logged in to access your URLs');
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const url = req.body.longURL;
  const newID = helpers.generateRandomString();
  const registered = helpers.checkRegistered(req, users);
  if (registered === false) {
    res.status(404).send('You must be logged in to create a new URL');
  } else { // Store data to send for post in urls/:id
    const userID = req.session.user_id;
    urlDatabase[newID] = {longURL: url, userID: userID};
    templateVars = { users: users, registered: registered, userID: userID, id: newID, longURL: url };
  }
  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  } else {
    res.status(404).send('URL must belong to user to delete it');
  }
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/`);
});

app.post("/urls/:id/edit", (req, res) =>{
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.id].userID) {
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(404).send('URL must belong to user to edit it');
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  const id = helpers.generateRandomString();
  /* NOTE: Given more time, I should come back and change these to take  
  *  advantage or type coercion. Instead of req.body.email === ""
  *  it should be implemented to utilize (req.body.email) {};
  */
  if (req.body.email === "" || req.body.password === "") { 
    res.status(400).send('Email or password can\'t be empty');
  } else if (helpers.emailChecker(req.body.email, users) !== undefined) {
    res.status(403).send('Email already exists');
  } else { // Register user if it passes previous checks
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = { id: id, email: req.body.email, password: hashedPassword };
    req.session.user_id = id;
    res.redirect('/urls/');
  }
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email or password can\'t be empty');
  }
  const userObject = helpers.emailChecker(req.body.email, users);
  if (userObject) {
    if (bcrypt.compareSync(req.body.password, userObject.password)) { // Bcrypt to check password
      req.session.user_id = userObject.id;
      res.redirect('/urls');
    } else {
      res.status(404).send('Incorrect password');
    }
  } else {
    res.status(404).send('User doesn\'t exist');
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
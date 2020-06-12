const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const bcrypt = require('bcrypt');
const saltRounds = 10;
//Encrypted cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['f080ac7b-b838-4c5f-a1f4-b0a9fee10130', 'c3fb18be-448b-4f6e-a377-49373e9b7e1a']
}))
app.set("view engine", "ejs");
const { findUserByEmail,
  addNewUser,
  authenticateUser,
  generateRandomString,
  urlsForUser } = require('./helpers.js');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ49lW" }
};

//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

//Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//render list of all shortURL and associated long URL created by current user
app.get("/urls", (req, res) => {
  let loggeduserId = req.session["user_id"];
  let templateVars = {
    user: users[loggeduserId],
    urls: urlsForUser(loggeduserId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

//render new template
app.get("/urls/new", (req, res) => {
  //extracting cookie to see if user is logged in
  if (![req.session["user_id"]]) {
    res.redirect('/login');
    return;
  }
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//Redirect any request to "/u/:shortURL" to its longURL even if they aren't logged in
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});
//Render information about a single URL.
app.get("/urls/:shortURL", (req, res) => {
  let loggeduserId = req.session["user_id"];

  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/urls');
    return;
  }
  let isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;

  let templateVars = {
    user: users[loggeduserId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    isOwnerCreator
  };
  res.render("urls_show", templateVars);
});
//update the URL
app.post("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/urls');
    return;
  }
  let loggeduserId = req.session["user_id"];
  let isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;
  if (!isOwnerCreator) {
    res.status(400).send('Error: cannot edit another creator\'s URL');
    return;
  }
  let shortURL = req.params.shortURL;
  let updatedlongURL = req.body.newURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  res.redirect('/urls');
});

//redirect url depending on structure of uRLDatabase keeping shortURL as key,
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

//delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let loggeduserId = req.session['user_id'];
  let isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;
  let shortURL = req.params.shortURL;
  
  if (!isOwnerCreator) {
    res.status(400).send('Error: cannot delete another creator\'s URL');
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Display the register form
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render('urls_register', templateVars);
});

// Handling the register form
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (email === '' || password === '') {
    res.status(400).send('User data is invalid!');
    return;
  } else if (!user) {
    const userID = addNewUser(email, password, users);
    // Setting the cookie in the user's browser
    req.session['user_id'] = userID;
    res.redirect('/urls');
  } else {
    res.status(400).send('already registered, please login');
    return;
  }
});

// Display the login form
app.get('/login', (req, res) => {
  let templateVars = {
    user: null
  };
  res.render('urls_login', templateVars);
});

//logout form
app.post('/logout', (req, res) => {
  // clear the cookie
  req.session["user_id"] = null;
  res.redirect('/urls');
})

//user login authentication N authenticates the user with the helper Fn
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = authenticateUser(email, users, password);

  if (!findUserByEmail(email, users)) {
    res.status(403).send('Email is not registered');
    return;
  }
  else if (!userID) {
    res.status(403).send('You have provided invalid credentials');
    return;
  } else {
    req.session["user_id"] = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
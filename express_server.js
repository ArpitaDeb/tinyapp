const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
const salt = 10;

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

//function to generate shortURL
function generateRandomString() {
  let shortURL = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  let length = 6;
  for (let i = 0; i < length; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return shortURL;
};
//function returns the filtered URLs where the userID is equal to the logged id
const urlsForUser = (loggeduserId) => {
  let filterURL = {};
  for (let shortURL in urlDatabase) {
    if ((urlDatabase[shortURL].userID) === loggeduserId) {
      filterURL[shortURL] = urlDatabase[shortURL];
    }
  } return filterURL;
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
  let loggeduserId = req.cookies["user_id"];
  let templateVars = {
    user: users[loggeduserId],
    urls: urlsForUser(loggeduserId),
  };
  res.render("urls_index", templateVars);
});

//render new template
app.get("/urls/new", (req, res) => {
  //extracting cookie to see if user is logged in
  if (![req.cookies["user_id"]]) {
    res.redirect('/login');
    return;
  }
  let templateVars = {
    user: users[req.cookies["user_id"]],
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
  let loggeduserId = req.cookies["user_id"];

  if (!urlDatabase[req.params.shortURL]) {
    console.log([req.params.shortURL]);
    res.redirect('/urls');
    return;
  }
  let isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;
  console.log(urlDatabase[req.params.shortURL].userID);

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
  let loggeduserId = req.cookies["user_id"];
  let isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;
  if (!isOwnerCreator) {
    res.status(400).send('Error: cannot edit another creator\'s URL');
    return;
  }
  let shortURL = req.params.shortURL;
  let updatedlongURL = req.body.newURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  console.log(shortURL, updatedlongURL, urlDatabase[shortURL]);
  res.redirect('/urls');
});

//redirect url depending on structure of uRLDatabase keeping shortURL as key,
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

//display the update form

//delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let loggeduserId = req.cookies['user_id'];
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
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_register', templateVars);
});
const addNewUser = (email, password) => {
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, salt)
  };
  users[userID] = newUser;
  return userID;
};
// Handling the register form
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (email === '' || password === '') {
    res.status(400).send('User data is invalid!');
    return;
  } else if (!user) {
    const userID = addNewUser(email, password);
    // Setting the cookie in the user's browser
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.status(400).send('already registered, please login');
    return;
    //return res.redirect('/login');
  }
});

//handle Registration Errors by findUserByEmail function
const findUserByEmail = (email) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  } return false;
};
//User Authentication
const authenticateUser = (email, password) => {
  // loop through the users db => object
  const user = findUserByEmail(email);
  if (user &&  bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
}
// Display the login form

app.get('/login', (req, res) => {
  let templateVars = {
    user: null
    //user: users[req.cookies["user_id"]],
    //urls: urlDatabase
  };
  res.render('urls_login', templateVars);
});
//logout form
app.post('/logout', (req, res) => {
  // clear the cookie
  res.clearCookie('user_id');
  // res.cookie("user_id", null);
  res.redirect('/urls');
})

//user login authentication N authenticates the user with the helper Fn
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = authenticateUser(email, password);
  if (!findUserByEmail(email)) {
    res.status(403).send('Email is not registered');
    return;
    //return res.redirect('/register');
  }
  else if (!userID) {
    res.status(403).send('You have provided invalid credentials');
    return;
  } else {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
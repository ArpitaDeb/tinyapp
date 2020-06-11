const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
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

//Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//render index template
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
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
//redirect users to visit the short URLs even if they aren't logged in
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});
//update the URL
app.post("/urls/:shortURL", (req, res) => {
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
    userId: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

//display the update form

//delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
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
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;
  return userId;
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
    const userId = addNewUser(email, password);
    // Setting the cookie in the user's browser
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    res.status(400).send('already registered, please login');
    return;
    //return res.redirect('/login');
  }
});

//handle Registration Errors by findUserByEmail function
const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  } return false;
};
//User Authentication
const authenticateUser = (email, password) => {
  // loop through the users db => object
  const user = findUserByEmail(email);
  if (user && user.password === password) {
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

//user login authentication
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  /* unable to make it work for all login functionality if (!findUserByEmail(email)) {
    res.status(403).send('Email is not registered');
  }
  else if (!authenticateUser(email, password)) {
    // user is not authenticated => error message
    res.status(403).send('Wrong credentials');
  } else {
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
  */
  //authenticates the user with the helper Fn
  const userId = authenticateUser(email, password);
  if (!findUserByEmail(email)) {
    res.status(403).send('Email is not registered');
    return;
    //return res.redirect('/register');
  }
  else if (!userId) {
    res.status(403).send('You have provided invalid credentials');
    return;
  } else {
    res.cookie("user_id", userId);
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
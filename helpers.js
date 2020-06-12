//handle Registration Errors by findUserByEmail function
const findUserByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  } return false;
};

const bcrypt = require('bcrypt');
const salt = 10;
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

const addNewUser = (email, users, password) => {
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, salt)
  };

  users[userID] = newUser;
  return userID;
};

//User Authentication
const authenticateUser = (email, users, password) => {
  // loop through the users db => object
  const user = findUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
};

//function returns the filtered URLs where the userID is equal to the logged id
const urlsForUser = (loggeduserId, urlDatabase) => {
  let filterURL = {};
  for (let shortURL in urlDatabase) {
    if ((urlDatabase[shortURL].userID) === loggeduserId) {
      filterURL[shortURL] = urlDatabase[shortURL];
    }
  } return filterURL;
};

module.exports = {
  findUserByEmail,
  addNewUser,
  authenticateUser,
  generateRandomString,
  urlsForUser
};
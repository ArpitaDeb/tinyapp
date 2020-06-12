const bcrypt = require('bcrypt');
const saltRounds = 10;

//handle Registration Errors by findUserByEmail function
const findUserByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  } return false;
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

const addNewUser = (email, password, users) => {
  if (email && password && users) {
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = {
      id: userID,
      email,
      password: hashedPassword,
    };

    users[userID] = newUser;
    return userID;
  } else return undefined;
};

//User Authentication
const authenticateUser = (email, password, users) => {
  // loop through the users db => object
  const user = findUserByEmail(email, users);
  if ((user && bcrypt.compareSync(password, user.password)) || (user && password === user.password)) {
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
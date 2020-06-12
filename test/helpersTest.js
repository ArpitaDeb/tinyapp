const { assert } = require('chai');

const { findUserByEmail,
  addNewUser,
  authenticateUser,
  generateRandomString,
  urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "sekhom": {
    id: "sekhom",
    email: "arpita@example.com",
    password: "deb"
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ49lW" }
};
describe('addNewUser', function() {
  it('should successfully return new userID', function() {
    const expectedOutput = 'randomString';
    const userID = addNewUser("arpi@example.com", 'password', testUsers)
   
    assert.isString(userID, expectedOutput);
  });
  it('should return false for a falsy value in email and password', function () {
    
    assert.strictEqual(addNewUser(null, undefined, testUsers), undefined);
  });
});

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    
    assert.deepEqual(findUserByEmail("user@example.com", testUsers), expectedOutput);
  });
  it('should return false for a non-existent email', function() {
    
    assert.strictEqual(findUserByEmail("existence@example.com", testUsers), false);
  });
});
describe('urlsForUser', function() {
  it('should return the filtered URLs where the userID is equal to the logged in userID and creator is user', function () {
    const actualURLObj = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput = {b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" }};
    assert.deepEqual(actualURLObj, expectedOutput);
  });
  it('should return empty object where the user didnot create any URL in database', function() {
    const actualURLObj = urlsForUser("arp", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(actualURLObj, expectedOutput);
  });
});
describe('authenticateUser', function() {
  it('should return false for an unmatching email and password of registered user', function() {
    assert.strictEqual(authenticateUser("unmatch@example.com", 'arpitadeb', testUsers), false);
  });
  it('should return a userID for matching email and password of registered user', function() {
    const user = authenticateUser("arpita@example.com", "deb", testUsers);
    const expectedOutput = "sekhom";
    
    assert.deepEqual(user, expectedOutput);
  });
});
describe('generateRandomString', function() {
  it('should generate a random string of 6 characters', function() {
    const characters = 6;
    assert.strictEqual((generateRandomString()).length, characters);
  });
});

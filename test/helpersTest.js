const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

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
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID'},
  "9sm5xK": { longURL: "http://www.google.com", userID: 'user2RandomID'}
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user === expectedOutput, `${user} is not equal to ${expectedOutput}`);
  });

  it(' a non-existent email should return undefined.', function() {
    const user = getUserByEmail("userCris@example.com", testUsers).id;
    const expectedOutput = undefined;
    // Write your assert statement here
    assert(user === expectedOutput, `${user} is not equal to ${expectedOutput}`);
  });
});

describe('urlsForUser', function() {
  it('should return an object of urls for the user', function() {
    const urls = urlsForUser("user2RandomID", urlDatabase);
    const expectedOutput = {'9sm5xK': "http://www.google.com"};
    // Write your assert statement here
    assert.deepEqual(urls, expectedOutput);
  });

  it('a non-existent user should return an empty object', function() {
    const urls = urlsForUser("user3RandomID", urlDatabase);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(urls, expectedOutput);
  });

});
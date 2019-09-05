const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

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
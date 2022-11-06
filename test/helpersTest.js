const { assert } = require('chai');

const helpers = require('../helpers');

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
    const user = helpers.emailChecker("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });
  it('should return a undefined with an invalid email', function() {
    const user = helpers.emailChecker("123@example.com", testUsers)
    assert.deepEqual(user, undefined);
  });
});
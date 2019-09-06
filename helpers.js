const getUserByEmail = function(email, database) {
  for (let ids in database) {
    if (database[ids]['email'] === email) {
      return database[ids];
    }
  } return false;
};

const getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

const generateRandomString = function() {
  let randomString = "";
  let arrayCharc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  let i = 0;

  while (i < 6) {
    randomString += arrayCharc[getRandomInt(61)];
    i++;
  }
  return randomString;
};

const urlsForUser = function(id, database) {
  let userUrls = {};
  for (let shortURL in database) {
    if (id === database[shortURL]['userID']) {
      userUrls[shortURL] = database[shortURL]['longURL'];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
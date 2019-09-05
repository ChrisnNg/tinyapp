const getUserByEmail = function(email, database) {
  for (let ids in database) {
    if (database[ids]['email'] === email) {
      return database[ids];
    }
  } console.log("Email unable to be found");
  return false;
};

module.exports = getUserByEmail;
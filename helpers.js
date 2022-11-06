function emailChecker(email, database) {
  for (keys in database) {
    if(database[keys].email === email) {
      return database[keys];
    }
  }
  return undefined;
}

module.exports = { emailChecker };
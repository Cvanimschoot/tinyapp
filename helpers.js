// Check if email is in database
function emailChecker(email, database) {
  for (keys in database) {
    if(database[keys].email === email) {
      return database[keys];
    }
  }
  return undefined;
}

// Check if a user is logged in and registered
function checkRegistered(req, database) {
  const username = req.session.user_id;
  if (!username || !database[username]) {
    return false
  }
  return true;
};

// Random string generation for new IDs
function generateRandomString() {
  const valuesForString = '0123456789abcdefghijklmnopqrstuvwxyz';
  let returnString = '';
  for (let i = 0; i < 6; i++) {
    const ranNum = Math.floor((Math.random() * 36));
    returnString += valuesForString[ranNum];
  }
  return returnString;
};

// Check URLs that belong to a unique user
function urlsForUser(id, database) {
  let urls = {};
  
  for(keys in database) {
    if(database[keys].userID === id) {
      urls[keys] = {longURL: database[keys].longURL};
    }
  }

  return urls;
};

module.exports = { emailChecker, checkRegistered, generateRandomString, urlsForUser };
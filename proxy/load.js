const environment = "replit"


module.exports = {
  DataBase: require(`./${environment}/database.js`),
  secrets: require(`./${environment}/secrets.js`),
}
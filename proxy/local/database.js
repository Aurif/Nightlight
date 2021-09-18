let db
(async ()=>{
  const path = require('path')
  const { Low, JSONFile } = await import('lowdb')
  const adapter = new JSONFile(path.resolve(__dirname, "./../../../database.json"))
  db = new Low(adapter)
})();

module.exports = {
  get: async (key) => {
    await db.read()
    db.data ||= {}
    return db.data[key]
  },
  set: async (key, value) => {
    await db.read()
    db.data ||= {}
    db.data[key] = value
    await db.write()
  }
}
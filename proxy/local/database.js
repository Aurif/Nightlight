let db
(async ()=>{
  const path = require('path')
  const { Low, JSONFile } = await import('lowdb')
  const adapter = new JSONFile(path.resolve(__dirname, "./../../../database.json"))
  db = new Low(adapter)
  await db.read()
  db.data ||= {}
})();

module.exports = {
  get: async (key) => {
    return db.data[key]
  },
  set: async (key, value) => {
    db.data[key] = value
    try {await db.write()}
    catch(e) {
      console.log("Error while saving database")
      let that = this
      setTimeout(()=>{tjat.set(key, value)}, 3000)
    }
  }
}
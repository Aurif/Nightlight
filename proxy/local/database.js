import { Low, JSONFile } from 'lowdb'
const adapter = new JSONFile("./../../../database.json")
const db = new Low(adapter)

module.exports = {
  get: async (key) => {
    await db.read()
    return db.data[key]
  }
  set: async (key, value) => {
    await db.read()
    db.data[key] = value
    await db.write()
  }
}
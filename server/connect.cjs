// connect.cjs
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

const client = new MongoClient(process.env.ATLAS_URI);

async function getDb() {
  if (!client.isConnected?.()) {
    await client.connect();
  }
  return client.db("RAYQuizA");
}

module.exports = { getDb };

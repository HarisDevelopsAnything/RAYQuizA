const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
console.log("MONGO_URI =", process.env.ATLAS_URI);

console.log(`Art Up API ${process.env.npm_package_version}`);

require("dotenv").config();

const express = require("express");
const useragent = require("express-useragent");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const app = express();

const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const detailRoute = require("./routes/details");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(useragent.express());

app.get("/api", (req, res) => {
    res.status(200).send(`Instabul V2 ${process.env.npm_package_version}`)
});

app.use("/api/user", authRoute);
// app.use("/api/posts", postRoute);
// app.use("/api/details", detailRoute);

console.log("Establishing connection with database...");
mongoose.connect(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("error", (error) => {
    console.log(error);
});

mongoose.connection.on("open", () => {
    console.log("Database connecion established");
});

app.listen(process.env.WEB_PORT, () => {
    console.log("API started at http://127.0.0.1:" + process.env.WEB_PORT);
});

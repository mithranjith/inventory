require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const CONFIG = require("./config/config");
const models = require("./models");

const app = express();

const PORT = CONFIG.port;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.json({
    message: "Hello! Welcome to backend!.",
  });
});

const v1 = require("./routes/v1");
app.use("/v1", v1);

app.listen(PORT, () => {
  console.log("App started on port", PORT);
});

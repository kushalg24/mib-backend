const express = require("express");
const app = express();
const axios = require("axios");

const PORT = 8000;

const mib_bearer = process.env.MIB_BEARER_TOKEN;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", async (req, res) => {
  res.json({ message: "ok" });
});



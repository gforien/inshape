const express = require('express');
const app = express();
const PORT = 8080;

app.get("/", function(req, res) {
  res.status(200).sendFile(__dirname + "/static/index.html");
});

app.get("/index.html", function(req, res) {
  res.status(200).sendFile(__dirname + "/static/index.html");
});

app.use(function(req, res) {
  res.status(404).send("404: Page not found");
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT);
});
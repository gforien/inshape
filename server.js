const PORT = 8080;
const express = require('express');
const app = express();

app.get("/", function(req, res) {
  res.status(200).sendFile(__dirname + "/static/index.html");
});

app.use(express.static(__dirname + "/static"));

app.use(function(req, res) {
  res.status(404).send("404: Page not found");
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT);
});
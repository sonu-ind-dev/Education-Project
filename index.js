const express = require("express");
const { addStudent } = require("./Actions/child");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hii");
});

// * To Create New Student Account
app.post("/addStudent", addStudent);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

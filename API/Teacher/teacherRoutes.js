const express = require("express");
const { signin } = require("./teacher");

const router = express.Router();

router.post("/signin", signin);

module.exports = router;

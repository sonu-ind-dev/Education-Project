const express = require("express");
const { signin } = require("./school");

const router = express.Router();

router.post("/signin", signin);

module.exports = router;

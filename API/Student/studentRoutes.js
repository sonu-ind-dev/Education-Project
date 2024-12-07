const express = require("express");
const { signin } = require("./student");

const router = express.Router();

router.post("/signin", signin);

module.exports = router;

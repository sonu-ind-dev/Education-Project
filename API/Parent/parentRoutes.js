const express = require("express");
const { signin } = require("./parent");

const router = express.Router();

router.post("/signin", signin);

module.exports = router;

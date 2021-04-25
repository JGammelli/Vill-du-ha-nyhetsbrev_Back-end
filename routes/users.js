var express = require('express');
var router = express.Router();
const fs = require("fs");
const cors = require("cors");
const { json } = require('express');
const { route } = require('.');

router.use(cors());



module.exports = router;

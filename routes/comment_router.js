let express = require("express");
let router = express.Router();
let CommController = require("../controllers/comm_controller");

// Comment 관리
CommController(router);

module.exports = router;
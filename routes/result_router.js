let express = require("express");
let router = express.Router();
let ResultController = require("../controllers/result_controller");

// Report Result 관리
ResultController(router);

module.exports = router;
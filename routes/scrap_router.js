let express = require("express");
let router = express.Router();
let ScrapController = require("../controllers/scrap_controller");

// 스크랩 관리
ScrapController(router);

module.exports = router;
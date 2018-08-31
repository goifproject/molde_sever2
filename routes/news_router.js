let express = require("express");
let router = express.Router();
let NewsController = require("../controllers/news_controller");

// Favorite 관리
NewsController(router);

module.exports = router;